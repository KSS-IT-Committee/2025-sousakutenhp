import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Supabaseクライアントのインポート
import { useCookies } from "react-cookie";

type ApiResponse =
  | { success: true }
  | { success: false; error: string };

type CheckUserResponse =
  | { success: true; exists: true }
  | { success: true; exists: false }
  | { success: false; error: string };

export default function VoteForm() {
  const [selectedClass, setSelectedClass] = useState(["0", "0", "0", "0", "0", "0"]);
  const [message, setMessage] = useState("");
  const [inputUserID, setInputUserID] = useState("");
  const [userID, setuserID] = useState("");
  const [cookies, setCookie] = useCookies(["userID", "selectedClass"]);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  // Turnstile スクリプトを一度だけ読み込む
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = () => setTurnstileLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (cookies.userID) {
      setInputUserID(cookies.userID);
      checkUserID();
    }
    if (cookies.selectedClass) {
      try {
        let arr = cookies.selectedClass;
        if (typeof arr === "string") arr = JSON.parse(arr);
        if (Array.isArray(arr)) setSelectedClass(arr);
      } catch (e) {}
    }
  }, []);

  // Turnstile token を取得する関数
  const getTurnstileToken = async (): Promise<string> => {
    if (!(window as any).turnstile) throw new Error("Turnstile not loaded");
    return (window as any).turnstile.execute(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY, { action: "submit" });
  };

  const submitVote = async () => {
    if (!userID) return alert("投票IDが未登録です");
    if (!turnstileLoaded) return alert("認証準備中です。少し待ってください。");

    try {
      const token = await getTurnstileToken();
      for (let i = 0; i < selectedClass.length; i++) {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userID,
            categoryId: i + 1,
            classId: selectedClass[i],
            turnstileToken: token,
          }),
        });
        const data = (await res.json()) as ApiResponse;
        if (!data.success) alert("投票に失敗しました：" + data.error);
      }
      alert("投票に成功しました！");
      setCookie("selectedClass", selectedClass, { path: "/" });
    } catch (err) {
      console.error(err);
      alert("Turnstile 認証またはサーバーエラーです");
    }
  };

  const checkUserID = async () => {
    if (!turnstileLoaded) return alert("認証準備中です。少し待ってください。");
    try {
      const token = await getTurnstileToken();
      const res = await fetch("/api/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: inputUserID, turnstileToken: token }),
      });
      const data = (await res.json()) as CheckUserResponse;
      if (data.success) {
        if (data.exists) {
          setuserID(inputUserID);
          setCookie("userID", inputUserID, { path: "/" });
          setMessage("投票IDが登録されました！");
        } else {
          setMessage(`この投票ID：${inputUserID}は登録されていません。`);
        }
      } else {
        setMessage("エラー: " + data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Turnstile 認証またはサーバーエラーです");
    }
  };

  return (
    <div>
      <div className="p-4 border rounded">
        <p>{message}</p>
        <div>
          <h2>投票ID</h2>
          <p>投票IDを入力してください</p>
          <input
            type="text"
            value={inputUserID}
            onChange={(e) => setInputUserID(e.target.value)}
            className="mt-2 p-1 border"
          />
          <button
            className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
            onClick={checkUserID}
          >
            ID登録
          </button>
        </div>
      </div>

      <div>
        <p className="text-lg font-bold">それぞれの部門でよいと思ったクラスを選んでください</p>
        {["立志外装", "開拓外装", "創作外装", "光庭立志", "光庭開拓", "光庭創作"].map((title, idx) => (
          <div key={idx}>
            <h3>{title}部門</h3>
            <select
              value={selectedClass[idx]}
              onChange={(e) => {
                const newArr = [...selectedClass];
                newArr[idx] = e.target.value;
                setSelectedClass(newArr);
              }}
              className="mt-2 p-1 border"
            >
              <option value="0">選んでください</option>
              {[...Array(25)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}年組</option>
              ))}
            </select>
          </div>
        ))}

        <button
          onClick={submitVote}
          className="mt-3 px-4 py-1 bg-blue-600 text-white rounded"
        >
          投票する
        </button>
      </div>
    </div>
  );
}
