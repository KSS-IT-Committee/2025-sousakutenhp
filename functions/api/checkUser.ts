import { createClient } from "@supabase/supabase-js";

type CheckUserRequest = {
  userId: string;
};

type CheckUserResponse =
  | { success: true; exists: true }
  | { success: true; exists: false }
  | { success: false; error: string };

export const onRequestPost: PagesFunction<{
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
}> = async ({ request, env }) => {
  try {
    const { userId } = (await request.json()) as CheckUserRequest;

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userIdが未指定です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", Number(userId))
      .limit(1);

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, exists: data.length > 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
