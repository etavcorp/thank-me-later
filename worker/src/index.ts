export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });
}

function getBodyJson<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
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
        headers: corsHeaders,
      });
    }

    if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
      const assetResponse = await serveAsset(request, env);
      if (assetResponse) {
        return assetResponse;
      }
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        await env.DB.prepare("SELECT 1 AS ok").first();
        return jsonResponse({ status: "healthy", db: "connected" });
      }

      if (url.pathname === "/api/menu" && request.method === "GET") {
        const result = await env.DB.prepare(
          "SELECT id, title, price, description, created_at FROM menu_items ORDER BY created_at DESC"
        ).all();

        if ((result.results ?? []).length === 0) {
          const seedItems = [
            ["Marinade Grilled Lamb Chops", "$35", "Juicy grilled lamb chops marinated to perfection."],
            ["Crispy Fried Chicken", "$22", "Golden, crispy fried chicken with savory seasoning."],
            ["Pan-Seared Salmon", "$28", "Fresh salmon seared to a delicate crisp finish."],
            ["Smothered Turkey Wings", "$24", "Tender turkey wings slow-cooked and smothered in rich gravy."],
            ["Baked Mac & Cheese", "$12", "Classic baked mac and cheese with creamy, comforting flavor."],
            ["Collard Greens", "$10", "Slow-simmered collard greens with savory southern seasoning."],
          ];

          const insertSql = "INSERT INTO menu_items (title, price, description) VALUES (?, ?, ?)";
          await Promise.all(
            seedItems.map((item) => env.DB.prepare(insertSql).bind(item[0], item[1], item[2]).run())
          );

          const seeded = await env.DB.prepare(
            "SELECT id, title, price, description, created_at FROM menu_items ORDER BY created_at DESC"
          ).all();

          return jsonResponse(seeded.results ?? []);
        }

        return jsonResponse(result.results ?? []);
      }

      if (url.pathname === "/api/menu" && request.method === "POST") {
        const body = await getBodyJson<{ title?: string; price?: string; description?: string }>(request);
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const price = typeof body.price === "string" ? body.price.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";

        if (!title || !price || !description) {
          return jsonResponse(
            { error: "title, price, and description are required" },
            { status: 400 }
          );
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
          { status: 201 }
        );
      }

      if (url.pathname.startsWith("/api/menu/") && request.method === "PUT") {
        const idParam = url.pathname.split("/").pop();
        const id = Number(idParam);

        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid menu item id is required" }, { status: 400 });
        }

        const body = await getBodyJson<{ title?: string; price?: string; description?: string }>(request);
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const price = typeof body.price === "string" ? body.price.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";

        if (!title || !price || !description) {
          return jsonResponse(
            { error: "title, price, and description are required" },
            { status: 400 }
          );
        }

        const result = await env.DB.prepare(
          "UPDATE menu_items SET title = ?, price = ?, description = ? WHERE id = ?"
        )
          .bind(title, price, description, id)
          .run();

        if (result.meta.changes === 0) {
          return jsonResponse({ error: "Menu item not found" }, { status: 404 });
        }

        return jsonResponse({ id, title, price, description });
      }

      if (url.pathname.startsWith("/api/menu/") && request.method === "DELETE") {
        const idParam = url.pathname.split("/").pop();
        const id = Number(idParam);

        if (!Number.isInteger(id)) {
          return jsonResponse({ error: "Valid menu item id is required" }, { status: 400 });
        }

        const result = await env.DB.prepare("DELETE FROM menu_items WHERE id = ?").bind(id).run();

        if (result.meta.changes === 0) {
          return jsonResponse({ error: "Menu item not found" }, { status: 404 });
        }

        return jsonResponse({ success: true, id });
      }

      if (url.pathname === "/api/menu/seed" && request.method === "POST") {
        const seedItems = [
          ["Marinade Grilled Lamb Chops", "$35", "Juicy grilled lamb chops marinated to perfection."],
          ["Crispy Fried Chicken", "$22", "Golden, crispy fried chicken with savory seasoning."],
          ["Pan-Seared Salmon", "$28", "Fresh salmon seared to a delicate crisp finish."],
          ["Smothered Turkey Wings", "$24", "Tender turkey wings slow-cooked and smothered in rich gravy."],
          ["Baked Mac & Cheese", "$12", "Classic baked mac and cheese with creamy, comforting flavor."],
          ["Collard Greens", "$10", "Slow-simmered collard greens with savory southern seasoning."],
        ];

        const insertSql = "INSERT INTO menu_items (title, price, description) VALUES (?, ?, ?)";
        await Promise.all(
          seedItems.map((item) => env.DB.prepare(insertSql).bind(item[0], item[1], item[2]).run())
        );

        return jsonResponse({ success: true, seeded: seedItems.length });
      }

      return jsonResponse({ error: "Not found" }, { status: 404 });
    } catch (error) {
      console.error("Worker API error:", error);
      return jsonResponse({ error: "Internal server error" }, { status: 500 });
    }
  },
};
