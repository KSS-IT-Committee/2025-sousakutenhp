export const onRequest: PagesFunction = async ({ request, next }) => {
  const allowedOrigins = [
    "https://sousakuten.com",
    "https://www.sousakuten.com",
  ];

  const origin = request.headers.get("Origin") || "";
  const headers = new Headers();

  if (allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // プリフライト（OPTIONS）リクエスト
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const response = await next();

  // レスポンスにもヘッダーを追加
  headers.forEach((value, key) => response.headers.set(key, value));

  return response;
};
