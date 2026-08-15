export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  APP_ENV?: string;
  AUTH_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  BOOTSTRAP_USERNAME?: string;
  BOOTSTRAP_PASSWORD?: string;
}

const encoder = new TextEncoder();
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8787",
  "http://127.0.0.1:8787",
  "http://localhost:4173",
  "https://thankmelatercatering.com",
  "https://www.thankmelatercatering.com",
  "https://uat.thankmelatercatering.com",
  "https://www.uat.thankmelatercatering.com",
  "https://thank-me-later-worker-prd.etavcorp.workers.dev",
  "https://thank-me-later-worker-uat.etavcorp.workers.dev",
];

function getAllowedOrigins(env: Env): string[] {
  const configuredOrigins = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins])];
}

function getRequestOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return null;
  }

  const configuredOrigins = getAllowedOrigins(env);
  if (configuredOrigins.includes(origin)) {
    return origin;
  }

  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    const isAllowedHost = hostname === "thankmelatercatering.com"
      || hostname.endsWith(".thankmelatercatering.com")
      || hostname.endsWith(".etavcorp.workers.dev")
      || hostname === "etavcorp.workers.dev";

    return isAllowedHost ? origin : null;
  } catch {
    return null;
  }
}

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };

  const origin = getRequestOrigin(request, env);
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function jsonResponse(data: unknown, request: Request, env: Env, init: ResponseInit = {}): Response {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...getCorsHeaders(request, env),
    ...(init.headers ?? {}),
  };

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function getBodyJson<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64UrlEncode(value: string): string {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlEncodeBytes(value: Uint8Array): string {
  let binary = "";
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return base64UrlEncode(binary);
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function createRandomToken(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return base64UrlEncodeBytes(bytes);
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return base64UrlEncodeBytes(new Uint8Array(digest));
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signJwtLike(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await deriveKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  const encodedSignature = base64UrlEncodeBytes(new Uint8Array(signature));
  return `${signingInput}.${encodedSignature}`;
}

async function verifyJwtLike(token: string, secret: string): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await deriveKey(secret);
  const providedSignature = base64UrlDecodeToBytes(encodedSignature);

  const isValid = await crypto.subtle.verify("HMAC", key, providedSignature, encoder.encode(signingInput));
  if (!isValid) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (typeof payload?.exp === "number" && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const saltB64 = bytesToBase64(salt);
  const hashB64 = bytesToBase64(new Uint8Array(derived));
  return `pbkdf2_sha256$${iterations}$${saltB64}$${hashB64}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    return false;
  }

  const [, iterationsText, saltB64, expectedHashB64] = parts;
  const iterations = Number(iterationsText);
  const salt = Uint8Array.from(atob(saltB64), (char) => char.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );

  const actualHashB64 = bytesToBase64(new Uint8Array(derived));
  return actualHashB64 === expectedHashB64;
}

function getAuthSecret(env: Env): string {
  return env.AUTH_SECRET || "local-dev-secret-change-me";
}

async function generateTotp(secret: string, timeStepSeconds: number): Promise<string> {
  const normalizedSecret = secret.replace(/\s+/g, "").toUpperCase();
  const keyBytes = base32ToBytes(normalizedSecret);
  const counter = BigInt(Math.floor(timeStepSeconds / 30));
  const counterBytes = new Uint8Array(8);
  let value = counter;

  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = Number(value & 0xFFn);
    value >>= 8n;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterBytes));
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff);
  const code = binary % 1000000;
  return code.toString().padStart(6, "0");
}

function base32ToBytes(secret: string): Uint8Array {
  if (!secret) {
    return new Uint8Array();
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let bitCount = 0;
  const bytes: number[] = [];

  for (const char of secret) {
    const value = alphabet.indexOf(char);
    if (value < 0) {
      continue;
    }

    bits = (bits << 5) | value;
    bitCount += 5;

    while (bitCount >= 8) {
      bitCount -= 8;
      bytes.push((bits >> bitCount) & 0xff);
    }
  }

  return Uint8Array.from(bytes);
}

async function verifyTotp(secret: string, candidateCode: string): Promise<boolean> {
  if (!secret || !candidateCode || !/^\d{6}$/.test(candidateCode.trim())) {
    return false;
  }

  const code = candidateCode.trim();
  const timeStepSeconds = Math.floor(Date.now() / 1000);

  for (let offset = -1; offset <= 1; offset++) {
    const actual = await generateTotp(secret, timeStepSeconds + offset * 30);
    if (actual === code) {
      return true;
    }
  }

  return false;
}

function createSessionToken(user: { id: number; username: string; role: string }, env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signJwtLike(
    {
      sub: String(user.id),
      username: user.username,
      role: user.role,
      iat: now,
      exp: now + 60 * 60 * 12,
    },
    getAuthSecret(env)
  );
}

async function verifySessionToken(token: string, env: Env): Promise<{ id: number; username: string; role: string } | null> {
  const payload = await verifyJwtLike(token, getAuthSecret(env));
  if (!payload || typeof payload.sub !== "string") {
    return null;
  }

  return {
    id: Number(payload.sub),
    username: typeof payload.username === "string" ? payload.username : "",
    role: typeof payload.role === "string" ? payload.role : "editor",
  };
}

async function requireAuth(request: Request, env: Env, allowedRoles: string[] = ["admin", "editor", "viewer"]) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return { authenticated: false, status: 401, error: "Missing bearer token" };
  }

  const payload = await verifySessionToken(match[1].trim(), env);
  if (!payload) {
    return { authenticated: false, status: 401, error: "Invalid or expired session" };
  }

  if (!allowedRoles.includes(payload.role)) {
    return { authenticated: false, status: 403, error: "Insufficient permissions" };
  }

  return { authenticated: true, user: payload };
}

async function createTrustedDeviceToken(userId: number, env: Env): Promise<string> {
  const token = createRandomToken(32);
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  await env.DB.prepare(
    "INSERT INTO trusted_devices (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
  ).bind(userId, tokenHash, expiresAt).run();

  return token;
}

async function verifyTrustedDeviceToken(userId: number, token: string, env: Env): Promise<boolean> {
  if (!token) {
    return false;
  }

  const tokenHash = await hashToken(token);
  const row = await env.DB.prepare(
    "SELECT 1 FROM trusted_devices WHERE user_id = ? AND token_hash = ? AND expires_at > datetime('now') LIMIT 1"
  ).bind(userId, tokenHash).first();

  return !!row;
}

export async function ensureDbSchema(env: Env): Promise<void> {
  if (!env.DB) {
    throw new Error("D1 database binding is missing.");
  }

  const userTableInfo = await env.DB.prepare("PRAGMA table_info(users)").all<{ name: string }>();
  const userColumnNames = new Set((userTableInfo.results ?? []).map((column) => column.name));
  const requiredColumns = [
    "username",
    "password_hash",
    "role",
    "totp_secret",
    "totp_enabled",
    "activation_code",
    "is_active",
    "created_at",
    "layout_preferences",
  ];

  if (userTableInfo.results === undefined || userTableInfo.results.length === 0) {
    await env.DB.prepare(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
        totp_secret TEXT,
        totp_enabled INTEGER NOT NULL DEFAULT 0,
        activation_code TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        layout_preferences TEXT DEFAULT '{}'
      )
    `).run();
  } else if (!requiredColumns.every((columnName) => userColumnNames.has(columnName))) {
    const hasLegacyEmail = userColumnNames.has("email");
    const hasLegacyName = userColumnNames.has("name");
    const legacyUsername = hasLegacyEmail ? "email" : hasLegacyName ? "name" : "username";

    await env.DB.prepare("ALTER TABLE users RENAME TO users_legacy").run();
    await env.DB.prepare(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
        totp_secret TEXT,
        totp_enabled INTEGER NOT NULL DEFAULT 0,
        activation_code TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        layout_preferences TEXT DEFAULT '{}'
      )
    `).run();

    const defaultPasswordHash = await hashPassword("ChangeMe123!");
    await env.DB.prepare(`
      INSERT INTO users (id, username, password_hash, role, totp_secret, totp_enabled, activation_code, is_active, created_at, layout_preferences)
      SELECT
        id,
        COALESCE(username, ${legacyUsername}, 'admin') AS username,
        COALESCE(password_hash, ?) AS password_hash,
        COALESCE(role, 'viewer') AS role,
        COALESCE(totp_secret, NULL) AS totp_secret,
        COALESCE(totp_enabled, 0) AS totp_enabled,
        NULL AS activation_code,
        1 AS is_active,
        COALESCE(created_at, CURRENT_TIMESTAMP) AS created_at,
        '{}' AS layout_preferences
      FROM users_legacy
    `).bind(defaultPasswordHash).run();

    await env.DB.prepare("DROP TABLE users_legacy").run();
  }

  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)").run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS trusted_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id)").run();

  const bookingTableInfo = await env.DB.prepare("PRAGMA table_info(bookings)").all<{ name: string }>();
  const bookingColumnNames = new Set((bookingTableInfo.results ?? []).map((column) => column.name));

  if (!bookingColumnNames.has("reference_number")) {
    await env.DB.prepare("ALTER TABLE bookings ADD COLUMN reference_number TEXT").run();
    await env.DB.prepare("UPDATE bookings SET reference_number = 'REQ-' || printf('%04d', id) WHERE reference_number IS NULL OR reference_number = ''").run();
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_number TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      type TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Booked', 'Declined')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference_number ON bookings(reference_number)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)").run();

  const duplicateRefs = await env.DB.prepare(
    "SELECT reference_number, COUNT(*) AS count FROM bookings WHERE reference_number IS NOT NULL GROUP BY reference_number HAVING COUNT(*) > 1"
  ).all<{ reference_number: string; count: number }>();

  for (const duplicate of duplicateRefs.results ?? []) {
    const rows = await env.DB.prepare(
      "SELECT id, reference_number FROM bookings WHERE reference_number = ? ORDER BY id ASC"
    ).bind(duplicate.reference_number).all<{ id: number; reference_number: string }>();

    for (let i = 1; i < (rows.results ?? []).length; i += 1) {
      let candidate = `${duplicate.reference_number}-${i}`;
      let counter = i;
      while (true) {
        const exists = await env.DB.prepare("SELECT 1 FROM bookings WHERE reference_number = ? LIMIT 1").bind(candidate).first();
        if (!exists) {
          break;
        }
        counter += 1;
        candidate = `${duplicate.reference_number}-${counter}`;
      }
      await env.DB.prepare("UPDATE bookings SET reference_number = ? WHERE id = ?").bind(candidate, (rows.results ?? [])[i].id).run();
    }
  }

  const missingRefs = await env.DB.prepare(
    "SELECT id FROM bookings WHERE reference_number IS NULL OR TRIM(reference_number) = '' ORDER BY id"
  ).all<{ id: number }>();

  for (const row of missingRefs.results ?? []) {
    let candidate = `REQ-${String(row.id).padStart(4, "0")}`;
    let suffix = 1;
    while (true) {
      const exists = await env.DB.prepare("SELECT 1 FROM bookings WHERE reference_number = ? AND id != ? LIMIT 1").bind(candidate, row.id).first();
      if (!exists) {
        break;
      }
      suffix += 1;
      candidate = `REQ-${String(row.id).padStart(4, "0")}-${suffix}`;
    }
    await env.DB.prepare("UPDATE bookings SET reference_number = ? WHERE id = ?").bind(candidate, row.id).run();
  }

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function seedDefaultAdminIfEmpty(env: Env): Promise<void> {
  if (!env.DB) {
    throw new Error("D1 database binding is missing.");
  }

  const appEnv = (env.APP_ENV ?? "").toLowerCase();
  if (appEnv !== "local") {
    return;
  }

  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").first<{ count: number }>();
  if (row && Number(row.count) > 0) {
    return;
  }

  const username = (env.BOOTSTRAP_USERNAME ?? "").trim();
  const password = (env.BOOTSTRAP_PASSWORD ?? "").trim();
  if (!username || !password || password.length < 8) {
    return;
  }

  const passwordHash = await hashPassword(password);
  await env.DB.prepare(
    "INSERT INTO users (username, password_hash, role, totp_secret, totp_enabled, activation_code, is_active) VALUES (?, ?, 'admin', NULL, 0, NULL, 1)"
  ).bind(username, passwordHash).run();
}

export async function seedMenuItemsIfEmpty(env: Env): Promise<void> {
  if (!env.DB) {
    throw new Error("D1 database binding is missing.");
  }

  const countResult = await env.DB.prepare("SELECT COUNT(*) AS count FROM menu_items").first<{ count: number }>();
  const count = Number(countResult?.count ?? 0);

  if (count > 0) {
    return;
  }

  const seedItems = [
    ["Marinade Grilled Lamb Chops", "$35", "Juicy grilled lamb chops marinated to perfection."],
    ["Crispy Fried Chicken", "$22", "Golden, crispy fried chicken with savory seasoning."],
    ["Pan-Seared Salmon", "$28", "Fresh salmon seared to a delicate crisp finish."],
    ["Smothered Turkey Wings", "$24", "Tender turkey wings slow-cooked and smothered in rich gravy."],
    ["Baked Mac & Cheese", "$12", "Classic baked mac and cheese with creamy, comforting flavor."],
    ["Collard Greens", "$10", "Slow-simmered collard greens with savory southern seasoning."],
  ];

  const insertSql = "INSERT INTO menu_items (title, price, description) VALUES (?, ?, ?)";
  for (const item of seedItems) {
    await env.DB.prepare(insertSql).bind(item[0], item[1], item[2]).run();
  }
}

async function generateUniqueBookingReference(env: Env): Promise<string> {
  const base = `REQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const seed = Math.random().toString(36).slice(2, 6).toUpperCase();
  let candidate = `${base}-${seed}`;

  while (true) {
    const exists = await env.DB.prepare("SELECT 1 FROM bookings WHERE reference_number = ? LIMIT 1").bind(candidate).first();
    if (!exists) {
      return candidate;
    }

    candidate = `${base}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}

async function serveAsset(request: Request, env: Env): Promise<Response | null> {
  if (!env.ASSETS) {
    return null;
  }

  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const fallbackRequest = new Request(new URL("/index.html", request.url), request);
  const fallbackResponse = await env.ASSETS.fetch(fallbackRequest);
  if (fallbackResponse.status !== 404) {
    return fallbackResponse;
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...getCorsHeaders(request, env),
          "Cache-Control": "no-store",
        },
      });
    }

    if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
      const assetResponse = await serveAsset(request, env);
      if (assetResponse) {
        return assetResponse;
      }
    }

    try {
      await ensureDbSchema(env);
      await seedDefaultAdminIfEmpty(env);
      await seedMenuItemsIfEmpty(env);

      if (url.pathname === "/api/health" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        return jsonResponse(
          {
            status: "healthy",
            db: "connected",
            environment: env.APP_ENV ?? "local",
            ok: result?.ok === 1,
          },
          request,
          env,
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }

      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        const body = await getBodyJson<{ username?: string; password?: string; totpCode?: string; trustedDeviceToken?: string; rememberThisBrowser?: boolean }>(request);
        const username = typeof body.username === "string" ? body.username.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const totpCode = typeof body.totpCode === "string" ? body.totpCode.trim() : "";
        const trustedDeviceToken = typeof body.trustedDeviceToken === "string" ? body.trustedDeviceToken.trim() : "";
        const rememberThisBrowser = body.rememberThisBrowser === true;

        if (!username || !password) {
          return jsonResponse({ error: "Username and password are required" }, request, env, { status: 400 });
        }

        const userRow = await env.DB.prepare(
          "SELECT id, username, password_hash, role, totp_secret, totp_enabled FROM users WHERE LOWER(username) = LOWER(?)"
        ).bind(username).first<{
          id: number;
          username: string;
          password_hash: string;
          role: string;
          totp_secret: string | null;
          totp_enabled: number;
        }>();

        if (!userRow) {
          return jsonResponse({ error: "Invalid username or password" }, request, env, { status: 401 });
        }

        const validPassword = await verifyPassword(password, userRow.password_hash);
        if (!validPassword) {
          return jsonResponse({ error: "Invalid username or password" }, request, env, { status: 401 });
        }

        if (Number(userRow.totp_enabled) === 1 && userRow.totp_secret) {
          const trustedDeviceOk = trustedDeviceToken ? await verifyTrustedDeviceToken(userRow.id, trustedDeviceToken, env) : false;
          if (!trustedDeviceOk && !totpCode) {
            return jsonResponse(
              { requiresTotp: true, message: "TOTP code required" },
              request,
              env,
              {
                status: 200,
                headers: { "Cache-Control": "no-store" },
              }
            );
          }

          if (!trustedDeviceOk) {
            const validTotp = await verifyTotp(userRow.totp_secret, totpCode);
            if (!validTotp) {
              return jsonResponse(
                { error: "Invalid TOTP code", requiresTotp: true },
                request,
                env,
                {
                  status: 401,
                  headers: { "Cache-Control": "no-store" },
                }
              );
            }
          }
        }

        let trustedDeviceTokenResponse: string | null = null;
        if (rememberThisBrowser && Number(userRow.totp_enabled) === 1 && userRow.totp_secret) {
          trustedDeviceTokenResponse = await createTrustedDeviceToken(userRow.id, env);
        }

        const token = await createSessionToken({ id: userRow.id, username: userRow.username, role: userRow.role }, env);
        return jsonResponse(
          {
            token,
            user: {
              id: userRow.id,
              username: userRow.username,
              role: userRow.role,
            },
            requiresTotp: false,
            trustedDeviceToken: trustedDeviceTokenResponse,
          },
          request,
          env,
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          }
        );
      }

      if (url.pathname === "/api/auth/setup-status" && request.method === "GET") {
        const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").first<{ count: number }>();
        const hasAdmin = Number(count?.count ?? 0) > 0;
        return jsonResponse(
          {
            hasAdmin,
            canCreateUser: hasAdmin,
            defaultRole: "admin",
            activationRequired: !hasAdmin,
          },
          request,
          env,
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      if (url.pathname === "/api/auth/me" && request.method === "GET") {
        const auth = await requireAuth(request, env, ["admin", "editor", "viewer"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const userRow = await env.DB.prepare(
          "SELECT id, username, role, totp_secret, totp_enabled, layout_preferences FROM users WHERE id = ? LIMIT 1"
        ).bind(auth.user.id).first<{
          id: number;
          username: string;
          role: string;
          totp_secret: string | null;
          totp_enabled: number;
          layout_preferences: string | null;
        }>();

        return jsonResponse(
          {
            id: auth.user.id,
            username: userRow?.username ?? auth.user.username,
            role: userRow?.role ?? auth.user.role,
            totp_enabled: Number(userRow?.totp_enabled ?? 0),
            totpEnabled: Number(userRow?.totp_enabled ?? 0) === 1,
            totp_secret: userRow?.totp_secret ?? null,
            totpSecret: userRow?.totp_secret ?? null,
            layout_preferences: userRow?.layout_preferences ?? "{}",
            layoutPreferences: userRow?.layout_preferences ?? "{}",
          },
          request,
          env,
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      if (url.pathname === "/api/auth/me" && request.method === "PATCH") {
        const auth = await requireAuth(request, env, ["admin", "editor", "viewer"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        let body: Record<string, unknown> = {};
        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const username = typeof body.username === "string" ? body.username.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const rawTotpEnabled = body.totpEnabled ?? body.totp_enabled ?? body.enableTotp ?? body.enable_totp ?? false;
        const totpEnabled = rawTotpEnabled === true || rawTotpEnabled === "true" || rawTotpEnabled === 1 || rawTotpEnabled === "1" ? 1 : 0;
        const rawTotpSecret = typeof body.totpSecret === "string"
          ? body.totpSecret.trim()
          : typeof body.totp_secret === "string"
            ? body.totp_secret.trim()
            : "";

        if (!username) {
          return jsonResponse({ error: "Username is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existingUser = await env.DB.prepare(
          "SELECT id, username FROM users WHERE LOWER(username) = LOWER(?) AND id != ? LIMIT 1"
        ).bind(username, auth.user.id).first<{ id: number; username: string }>();

        if (existingUser) {
          return jsonResponse({ error: "A user with that username already exists." }, request, env, { status: 409, headers: { "Cache-Control": "no-store" } });
        }

        const currentUser = await env.DB.prepare(
          "SELECT id, username, password_hash, totp_secret, totp_enabled FROM users WHERE id = ? LIMIT 1"
        ).bind(auth.user.id).first<{
          id: number;
          username: string;
          password_hash: string;
          totp_secret: string | null;
          totp_enabled: number;
        }>();

        if (!currentUser) {
          return jsonResponse({ error: "User not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        const nextPasswordHash = password ? await hashPassword(password) : currentUser.password_hash;
        const nextTotpEnabled = totpEnabled;
        const nextTotpSecret = rawTotpSecret || currentUser.totp_secret || null;

        if (password && password.length < 8) {
          return jsonResponse({ error: "Password must be at least 8 characters long" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        await env.DB.prepare(
          "UPDATE users SET username = ?, password_hash = ?, totp_enabled = ?, totp_secret = ? WHERE id = ?"
        ).bind(username, nextPasswordHash, nextTotpEnabled, nextTotpSecret, auth.user.id).run();

        return jsonResponse(
          {
            id: auth.user.id,
            username,
            role: auth.user.role,
            passwordUpdated: Boolean(password),
            totpEnabled: nextTotpEnabled === 1,
            totp_enabled: nextTotpEnabled,
            totpSecret: nextTotpSecret,
            totp_secret: nextTotpSecret,
          },
          request,
          env,
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      if ((url.pathname === "/api/auth/setup-admin" || url.pathname === "/api/admin/bootstrap" || url.pathname === "/api/admin/register") && request.method === "POST") {
        let body: Record<string, unknown> = {};

        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const username = typeof body.username === "string"
          ? body.username.trim()
          : typeof body.email === "string"
            ? body.email.trim()
            : typeof body.name === "string"
              ? body.name.trim()
              : "";

        const password = typeof body.password === "string" ? body.password : "";
        const role = typeof body.role === "string" && ["admin", "editor", "viewer"].includes(body.role) ? body.role : "admin";
        const rawTotpEnabled = body.totpEnabled ?? body.totp_enabled ?? body.enableTotp ?? body.enable_totp ?? false;
        const totpEnabled = rawTotpEnabled === true || rawTotpEnabled === "true" || rawTotpEnabled === 1 || rawTotpEnabled === "1" ? 1 : 0;
        const rawTotpSecret = typeof body.totpSecret === "string"
          ? body.totpSecret
          : typeof body.totp_secret === "string"
            ? body.totp_secret
            : "";
        const totpSecret = rawTotpSecret.trim() ? rawTotpSecret.trim() : null;
        const adminCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").first<{ count: number }>();

        if (Number(adminCount?.count ?? 0) > 0) {
          return jsonResponse({ error: "Admin bootstrap is already complete" }, request, env, { status: 409, headers: { "Cache-Control": "no-store" } });
        }

        if (!username || !password || password.length < 8) {
          return jsonResponse({ error: "Username and password (minimum 8 chars) are required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const passwordHash = await hashPassword(password);

        const result = await env.DB.prepare(
          "INSERT INTO users (username, password_hash, role, totp_secret, totp_enabled, activation_code, is_active) VALUES (?, ?, ?, ?, ?, NULL, 1)"
        ).bind(username, passwordHash, role, totpSecret, totpEnabled).run();

        return jsonResponse(
          {
            id: result.meta.last_row_id ?? null,
            username,
            role,
            totpEnabled: Boolean(totpEnabled),
          },
          request,
          env,
          { status: 201, headers: { "Cache-Control": "no-store" } }
        );
      }

      if ((url.pathname === "/api/auth/create-user" || url.pathname === "/api/users/create") && request.method === "POST") {
        const auth = await requireAuth(request, env, ["admin"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        let body: Record<string, unknown> = {};

        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const username = typeof body.username === "string" ? body.username.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const activationCode = typeof body.activationCode === "string" ? body.activationCode.trim() : "";
        const expectedActivationCode = (env.AUTH_SECRET || "ACTIVATE-2026").trim();
        const requestedRole = typeof body.role === "string" ? body.role : "viewer";
        const finalRole = ["admin", "editor", "viewer"].includes(requestedRole) ? requestedRole : "viewer";

        if (!username || !password || password.length < 8) {
          return jsonResponse({ error: "Username and password (minimum 8 chars) are required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existingUser = await env.DB.prepare(
          "SELECT 1 FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1"
        ).bind(username).first();

        if (existingUser) {
          return jsonResponse({ error: "A user with that username already exists." }, request, env, { status: 409, headers: { "Cache-Control": "no-store" } });
        }

        const hasExistingUsers = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>();
        const adminUserExists = Number(hasExistingUsers?.count ?? 0) > 0;
        if (adminUserExists && activationCode && activationCode !== expectedActivationCode) {
          return jsonResponse({ error: "A valid activation code is required to create a new user." }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const passwordHash = await hashPassword(password);
        const result = await env.DB.prepare(
          "INSERT INTO users (username, password_hash, role, totp_secret, totp_enabled, activation_code, is_active) VALUES (?, ?, ?, NULL, 0, ?, 1)"
        ).bind(username, passwordHash, finalRole, activationCode || null).run();

        return jsonResponse(
          {
            id: result.meta.last_row_id ?? null,
            username,
            role: finalRole,
            activationRequired: false,
            totpEnabled: false,
          },
          request,
          env,
          { status: 201, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (url.pathname === "/api/bookings" && request.method === "POST") {
        let body: Record<string, unknown> = {};

        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const name = typeof body.name === "string" ? body.name.trim() : "";
        const phone = typeof body.phone === "string" ? body.phone.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const type = typeof body.type === "string" ? body.type.trim() : "";
        const guestsRaw = body.guests;
        const guests = Number.isFinite(Number(guestsRaw)) ? Number(guestsRaw) : 0;
        const date = typeof body.date === "string" ? body.date.trim() : "";
        const notes = typeof body.notes === "string" ? body.notes.trim() : "";

        if (!name || !phone || !email || !type || !date || guests <= 0) {
          return jsonResponse({ error: "Name, phone, email, event type, date, and guest count are required." }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const referenceNumber = await generateUniqueBookingReference(env);

        const result = await env.DB.prepare(
          "INSERT INTO bookings (reference_number, name, phone, email, type, guests, date, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', CURRENT_TIMESTAMP)"
        ).bind(referenceNumber, name, phone, email, type, String(guests), date, notes).run();

        return jsonResponse(
          {
            id: result.meta.last_row_id ?? null,
            reference_number: referenceNumber,
            name,
            phone,
            email,
            type,
            guests,
            date,
            notes,
            status: "New",
          },
          request,
          env,
          { status: 201, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (url.pathname === "/api/admin/bookings" && request.method === "GET") {
        const auth = await requireAuth(request, env, ["admin", "editor"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const result = await env.DB.prepare(
          "SELECT id, reference_number, name, phone, email, type, guests, date, notes, status, created_at FROM bookings ORDER BY created_at DESC"
        ).all();

        return jsonResponse(result.results ?? [], request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname.startsWith("/api/admin/bookings/") && request.method === "PUT") {
        const auth = await requireAuth(request, env, ["admin", "editor"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const id = Number(url.pathname.split("/").pop());
        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid booking ID is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        let body: Record<string, unknown> = {};
        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const status = typeof body.status === "string" ? body.status.trim() : "";
        const allowedStatuses = ["New", "Contacted", "Booked", "Declined"];
        if (!allowedStatuses.includes(status)) {
          return jsonResponse({ error: "Status must be one of: New, Contacted, Booked, Declined" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existing = await env.DB.prepare("SELECT id FROM bookings WHERE id = ? LIMIT 1").bind(id).first<{ id: number }>();
        if (!existing) {
          return jsonResponse({ error: "Booking not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind(status, id).run();

        const updated = await env.DB.prepare(
          "SELECT id, name, phone, email, type, guests, date, notes, status, created_at FROM bookings WHERE id = ? LIMIT 1"
        ).bind(id).first<{
          id: number;
          name: string;
          phone: string;
          email: string;
          type: string;
          guests: number;
          date: string;
          notes: string | null;
          status: string;
          created_at: string;
        }>();

        return jsonResponse(updated ?? { id, status }, request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname.startsWith("/api/admin/bookings/") && request.method === "DELETE") {
        const auth = await requireAuth(request, env, ["admin", "editor"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const id = Number(url.pathname.split("/").pop());
        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid booking ID is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existing = await env.DB.prepare("SELECT id FROM bookings WHERE id = ? LIMIT 1").bind(id).first<{ id: number }>();
        if (!existing) {
          return jsonResponse({ error: "Booking not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        await env.DB.prepare("DELETE FROM bookings WHERE id = ?").bind(id).run();
        return jsonResponse({ success: true, id }, request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname === "/api/admin/users/preferences" && request.method === "GET") {
        const auth = await requireAuth(request, env, ["admin", "editor", "viewer"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const userRow = await env.DB.prepare(
          "SELECT layout_preferences FROM users WHERE id = ? LIMIT 1"
        ).bind(auth.user.id).first<{ layout_preferences: string | null }>();

        return jsonResponse(
          {
            layout_preferences: userRow?.layout_preferences ?? "[]",
            layoutPreferences: userRow?.layout_preferences ?? "[]",
          },
          request,
          env,
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      if (url.pathname === "/api/admin/users/preferences" && request.method === "PUT") {
        const auth = await requireAuth(request, env, ["admin", "editor", "viewer"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        let body: Record<string, unknown> = {};
        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const rawLayout = body.layout_preferences ?? body.layoutPreferences ?? body.layout ?? "[]";
        let parsedLayout: unknown = rawLayout;

        if (typeof rawLayout === "string") {
          try {
            parsedLayout = JSON.parse(rawLayout);
          } catch {
            return jsonResponse({ error: "layout_preferences must be valid JSON" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
          }
        }

        const normalizedLayout = Array.isArray(parsedLayout)
          ? parsedLayout.map((item) => ({
              key: typeof item?.key === "string" ? item.key : "",
              label: typeof item?.label === "string" ? item.label : "",
              visible: item && typeof item === "object" && "visible" in item ? Boolean((item as { visible?: unknown }).visible) : true,
              order: typeof item?.order === "number" ? item.order : 0,
            })).filter((item) => item.key)
          : [];

        const payload = JSON.stringify(normalizedLayout);
        await env.DB.prepare("UPDATE users SET layout_preferences = ? WHERE id = ?").bind(payload, auth.user.id).run();

        return jsonResponse(
          {
            layout_preferences: payload,
            layoutPreferences: payload,
            saved: true,
          },
          request,
          env,
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      if (url.pathname === "/api/admin/users" && request.method === "GET") {
        const auth = await requireAuth(request, env, ["admin"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const rows = await env.DB.prepare(
          "SELECT id, username, role, totp_secret, totp_enabled, created_at FROM users ORDER BY created_at DESC"
        ).all<{
          id: number;
          username: string;
          role: string;
          totp_secret: string | null;
          totp_enabled: number;
          created_at: string;
        }>();

        return jsonResponse((rows.results ?? []).map((row) => ({
          id: row.id,
          username: row.username,
          role: row.role,
          totp_enabled: Number(row.totp_enabled ?? 0),
          totpEnabled: Number(row.totp_enabled ?? 0) === 1,
          totp_secret: row.totp_secret ?? null,
          created_at: row.created_at,
        })), request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname === "/api/admin/users" && request.method === "POST") {
        const auth = await requireAuth(request, env, ["admin"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        let body: Record<string, unknown> = {};
        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const username = typeof body.username === "string" ? body.username.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const requestedRole = typeof body.role === "string" ? body.role : "viewer";
        const role = ["admin", "editor", "viewer"].includes(requestedRole) ? requestedRole : "viewer";
        const rawTotpEnabled = body.totp_enabled ?? body.totpEnabled ?? body.totp_enabled ?? false;
        const totpEnabled = rawTotpEnabled === true || rawTotpEnabled === "true" || rawTotpEnabled === 1 || rawTotpEnabled === "1" ? 1 : 0;
        const requestedTotpSecret = typeof body.totp_secret === "string" ? body.totp_secret.trim() : typeof body.totpSecret === "string" ? body.totpSecret.trim() : "";
        const totpSecret = requestedTotpSecret || null;

        if (!username || !password || password.length < 8) {
          return jsonResponse({ error: "Username and password (minimum 8 chars) are required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existing = await env.DB.prepare("SELECT 1 FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1").bind(username).first();
        if (existing) {
          return jsonResponse({ error: "A user with that username already exists." }, request, env, { status: 409, headers: { "Cache-Control": "no-store" } });
        }

        const passwordHash = await hashPassword(password);
        const result = await env.DB.prepare(
          "INSERT INTO users (username, password_hash, role, totp_secret, totp_enabled, activation_code, is_active) VALUES (?, ?, ?, ?, ?, NULL, 1)"
        ).bind(username, passwordHash, role, totpSecret, totpEnabled).run();

        return jsonResponse({
          id: result.meta.last_row_id ?? null,
          username,
          role,
          totp_enabled: totpEnabled,
          totpEnabled: totpEnabled === 1,
          totp_secret: totpSecret,
        }, request, env, { status: 201, headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname.startsWith("/api/admin/users/") && request.method === "PUT") {
        const auth = await requireAuth(request, env, ["admin"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const id = Number(url.pathname.split("/").pop());
        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid user ID is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        let body: Record<string, unknown> = {};
        try {
          body = await getBodyJson<Record<string, unknown>>(request);
        } catch {
          body = {};
        }

        const current = await env.DB.prepare("SELECT id, username, password_hash, role, totp_secret, totp_enabled FROM users WHERE id = ? LIMIT 1").bind(id).first<{
          id: number;
          username: string;
          password_hash: string;
          role: string;
          totp_secret: string | null;
          totp_enabled: number;
        }>();

        if (!current) {
          return jsonResponse({ error: "User not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        const username = typeof body.username === "string" ? body.username.trim() : current.username;
        const password = typeof body.password === "string" ? body.password : "";
        const requestedRole = typeof body.role === "string" ? body.role : current.role;
        const role = ["admin", "editor", "viewer"].includes(requestedRole) ? requestedRole : current.role;
        const rawTotpEnabled = body.totp_enabled ?? body.totpEnabled ?? current.totp_enabled;
        const totpEnabled = rawTotpEnabled === true || rawTotpEnabled === "true" || rawTotpEnabled === 1 || rawTotpEnabled === "1" ? 1 : 0;
        const requestedTotpSecret = typeof body.totp_secret === "string" ? body.totp_secret.trim() : typeof body.totpSecret === "string" ? body.totpSecret.trim() : current.totp_secret ?? "";
        const nextPasswordHash = password && password.length >= 8 ? await hashPassword(password) : current.password_hash;

        await env.DB.prepare(
          "UPDATE users SET username = ?, password_hash = ?, role = ?, totp_secret = ?, totp_enabled = ? WHERE id = ?"
        ).bind(username, nextPasswordHash, role, requestedTotpSecret || null, totpEnabled, id).run();

        return jsonResponse({
          id,
          username,
          role,
          passwordUpdated: Boolean(password && password.length >= 8),
          totp_enabled: totpEnabled,
          totpEnabled: totpEnabled === 1,
          totp_secret: requestedTotpSecret || null,
        }, request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname.startsWith("/api/admin/users/") && request.method === "DELETE") {
        const auth = await requireAuth(request, env, ["admin"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const id = Number(url.pathname.split("/").pop());
        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid user ID is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ? LIMIT 1").bind(id).first<{ id: number }>();
        if (!existing) {
          return jsonResponse({ error: "User not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        if (existing.id === auth.user.id) {
          return jsonResponse({ error: "You cannot delete your own account while signed in." }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
        return jsonResponse({ success: true, id }, request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname === "/api/menu" && request.method === "GET") {
        const result = await env.DB.prepare(
          "SELECT id, title, price, description, created_at FROM menu_items ORDER BY created_at DESC"
        ).all();

        if ((result.results ?? []).length === 0) {
          await seedMenuItemsIfEmpty(env);

          const seeded = await env.DB.prepare(
            "SELECT id, title, price, description, created_at FROM menu_items ORDER BY created_at DESC"
          ).all();

          return jsonResponse(seeded.results ?? [], request, env, {
            headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
          });
        }

        return jsonResponse(result.results ?? [], request, env, {
          headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
        });
      }

      if (url.pathname === "/api/menu" && request.method === "POST") {
        const auth = await requireAuth(request, env, ["admin", "editor"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const body = await getBodyJson<{ title?: string; price?: string; description?: string }>(request);
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const price = typeof body.price === "string" ? body.price.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";

        if (!title || !price || !description) {
          return jsonResponse({ error: "title, price, and description are required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const result = await env.DB.prepare(
          "INSERT INTO menu_items (title, price, description) VALUES (?, ?, ?)"
        )
          .bind(title, price, description)
          .run();

        return jsonResponse(
          {
            id: result.meta.last_row_id ?? null,
            title,
            price,
            description,
          },
          request,
          env,
          {
            status: 201,
            headers: { "Cache-Control": "no-store" },
          }
        );
      }

      if (url.pathname.startsWith("/api/menu/") && request.method === "PUT") {
        const auth = await requireAuth(request, env, ["admin", "editor"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const idParam = url.pathname.split("/").pop();
        const id = Number(idParam);

        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid menu item id is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const body = await getBodyJson<{ title?: string; price?: string; description?: string }>(request);
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const price = typeof body.price === "string" ? body.price.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";

        if (!title || !price || !description) {
          return jsonResponse({ error: "title, price, and description are required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existingItem = await env.DB.prepare(
          "SELECT id FROM menu_items WHERE id = ? LIMIT 1"
        ).bind(id).first<{ id: number }>();

        if (!existingItem) {
          return jsonResponse({ error: "Menu item not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        await env.DB.prepare(
          "UPDATE menu_items SET title = ?, price = ?, description = ? WHERE id = ?"
        )
          .bind(title, price, description, id)
          .run();

        return jsonResponse({ id, title, price, description }, request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname.startsWith("/api/menu/") && request.method === "DELETE") {
        const auth = await requireAuth(request, env, ["admin", "editor"]);
        if (!auth.authenticated) {
          return jsonResponse({ error: auth.error }, request, env, { status: auth.status, headers: { "Cache-Control": "no-store" } });
        }

        const idParam = url.pathname.split("/").pop();
        const id = Number(idParam);

        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid menu item id is required" }, request, env, { status: 400, headers: { "Cache-Control": "no-store" } });
        }

        const existingItem = await env.DB.prepare(
          "SELECT id FROM menu_items WHERE id = ? LIMIT 1"
        ).bind(id).first<{ id: number }>();

        if (!existingItem) {
          return jsonResponse({ error: "Menu item not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
        }

        await env.DB.prepare("DELETE FROM menu_items WHERE id = ?").bind(id).run();

        return jsonResponse({ success: true, id }, request, env, { headers: { "Cache-Control": "no-store" } });
      }

      if (url.pathname.startsWith("/api/")) {
        return jsonResponse({ error: "Not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
      }

      return jsonResponse({ error: "Not found" }, request, env, { status: 404, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      console.error("Worker API error:", { message, stack });
      return jsonResponse(
        {
          error: "Internal server error",
          debug: message,
        },
        request,
        env,
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }
  },
};
