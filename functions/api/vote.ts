import { createClient } from "@supabase/supabase-js";

type VoteRequest = {
  userId: string;
  classId: string;
  categoryId: string;
};

type CheckUserResponse =
  | { success: true; exists: true }
  | { success: true; exists: false }
  | { success: false; error: string };

  
export const onRequestPost: PagesFunction<{
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}> = async (context) => {
  try {
    const { request, env } = context;
    const { userId, classId, categoryId } = (await request.json()) as VoteRequest;

    if (!userId || !classId || !categoryId) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Supabaseクライアント作成
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // UPSERTで「同じuserIdなら更新、それ以外は新規挿入」
    const { error } = await supabase
      .from("votes")
      .upsert([{ user_id: userId, class_id: classId, category_id: categoryId }], { onConflict: "user_id,category_id" });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
