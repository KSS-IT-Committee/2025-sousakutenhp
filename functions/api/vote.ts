import { createClient } from "@supabase/supabase-js";

type VoteRequest = {
  userId: string;
  classId: string;
  categoryId: string;
  rank: number;
  turnstileToken?: string;
};

type CheckUserResponse =
  | { success: true; exists: true }
  | { success: true; exists: false }
  | { success: false; error: string };


export const onRequestPost: PagesFunction<{
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}> = async (context) => {
  try {
    const { request, env } = context;
    const { userId, classId, categoryId, rank, turnstileToken } = (await request.json()) as VoteRequest;
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ success: false, error: "No turnstile token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    // Turnstile検証
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
    });
    const verifyData = await verifyRes.json() as { success: boolean; [key: string]: any };
    if (!verifyData.success) {
      return new Response(
        JSON.stringify({ success: false, error: "認証に失敗しました" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }


    if (!userId || !classId || !categoryId || !rank) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Supabaseクライアント作成
    const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
    // UPSERTで「同じuserIdなら更新、それ以外は新規挿入」
    if (classId == "0") {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("user_id", userId)
        .eq("category_id", categoryId)
        .eq("rank", rank);
      console.log("delete", userId, categoryId, rank);
      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      const { error } = await supabase
        .from("votes")
        .upsert([{ user_id: userId, class_id: classId, category_id: categoryId, rank: rank }], { onConflict: "user_id,category_id,rank" });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
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
