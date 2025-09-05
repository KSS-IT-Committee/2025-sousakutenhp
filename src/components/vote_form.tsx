import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
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
    const [userID, setUserID] = useState("");
    const [cookies, setCookie] = useCookies(["userID", "selectedClass"]);
    const turnstileRef = useRef<HTMLDivElement | null>(null);
    const [turnstileLoaded, setTurnstileLoaded] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Turnstile スクリプト読み込み
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.onload = () => setTurnstileLoaded(true);
        document.body.appendChild(script);
    }, []);

    // Turnstile widget 描画
    useEffect(() => {
        if (!turnstileLoaded || !turnstileRef.current) return;

        const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string;
        if (!siteKey) {
            console.error("Turnstile sitekey が未定義です");
            return;
        }
        console.log(siteKey);

        (window as any).turnstile.render(turnstileRef.current, {
            sitekey: siteKey,
            size: "invisible",
            callback: (token: string) => setTurnstileToken(token),
        });
    }, [turnstileLoaded]);

    // Cookie から復元
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
            } catch { }
        }
    }, []);

    // 投票送信
    async function submitVote() {
        if (!userID) return alert("投票IDが未登録です");
        if (!turnstileRef.current) return alert("Turnstile widget が準備中です");

        // token がまだ取得できていなければ execute して再度 submitVote を呼ぶ
        if (!turnstileToken) {
            (window as any).turnstile.execute(turnstileRef.current);
            return;
        }

        try {
            for (let i = 0; i < selectedClass.length; i++) {
                const res = await fetch("/api/vote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userID,
                        categoryId: i + 1,
                        classId: selectedClass[i],
                        turnstileToken,
                    }),
                });
                const data = (await res.json()) as ApiResponse;
                if (!data.success) {
                    alert("投票に失敗しました：" + data.error);
                    return;
                }
            }
            alert("投票に成功しました！");
            setCookie("selectedClass", selectedClass, { path: "/" });
            setTurnstileToken(null); // token は使い切り
        } catch (err) {
            console.error(err);
            alert("Turnstile 認証またはサーバーエラーです");
        }
    }

    // ユーザーIDチェック
    async function checkUserID() {
        if (!turnstileLoaded) return alert("認証準備中です。少し待ってください。");

        try {
            if (!turnstileToken) {
                (window as any).turnstile.execute(turnstileRef.current);
                return;
            }

            const res = await fetch("/api/checkUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: inputUserID, turnstileToken }),
            });
            const data = (await res.json()) as CheckUserResponse;

            if (data.success) {
                if (data.exists) {
                    setUserID(inputUserID);
                    setCookie("userID", inputUserID, { path: "/" });
                    setMessage("投票IDが登録されました！");
                } else {
                    setMessage(`この投票ID：${inputUserID}は登録されていません。`);
                }
            } else {
                setMessage("エラー: " + data.error);
            }
            setTurnstileToken(null); // token は使い切り
        } catch (err) {
            console.error(err);
            setMessage("Turnstile 認証またはサーバーエラーです");
        }
    }

    return (
        <div>
            <div className="p-4 border rounded">
                <p>{message}</p>
                <div ref={turnstileRef} className="cf-turnstile" />
                <div>
                    <h2>投票ID</h2>
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
