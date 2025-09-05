import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient"; // Supabaseクライアントのインポート
import { CookiesProvider, useCookies } from "react-cookie";

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
    // TODO: UserIDが設定された後にのみ投票できるようにする
    // TODO: SelectedClassをcookieに保存して、ページリロード後も選択を保持する
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const tokenExpireTimer = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        // Cloudflare Turnstile script を読み込み
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        document.body.appendChild(script);

        // Invisible モードで埋め込み
        const widget = document.createElement("div");
        widget.className = "cf-turnstile";
        widget.setAttribute("data-sitekey", import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);
        widget.setAttribute("data-callback", "onTurnstileSuccess");
        widget.setAttribute("data-size", "invisible");
        document.body.appendChild(widget);

        // グローバルコールバックを定義
        (window as any).onTurnstileSuccess = (token: string) => {
            setTurnstileToken(token);
        };
    }, []);

    useEffect(() => {
        if (cookies.userID != null) {
            setInputUserID(cookies.userID);
            checkUserID();
        }
        if (cookies.selectedClass != null) {
            try {
                // cookieが配列で保存されている場合
                let arr = cookies.selectedClass;
                if (typeof arr === "string") {
                    arr = JSON.parse(arr);
                }
                if (Array.isArray(arr)) {
                    setSelectedClass(arr);
                }
            } catch (e) {
                // パース失敗時は何もしない
            }
        }

        return () => {
            if (tokenExpireTimer.current) clearTimeout(tokenExpireTimer.current);
        };
    }, []);


    async function submitVote() {
        if (!userID) {
            alert("投票IDが未登録です");
            return;
        }
        if (!turnstileToken) {
            alert("認証トークン取得中です。しばらくお待ちください。");
            return;
        }
        try {
            for (let i = 0; i < selectedClass.length; i++) {
                const res = await fetch("/api/vote", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: userID, categoryId: i + 1, classId: selectedClass[i], turnstileToken }),
                });

                const data = (await res.json()) as ApiResponse;

                if (data.success) {
                    // alert("投票が完了しました！");
                } else {
                    alert("投票に失敗しました：" + data.error);
                }
            }
            alert("投票に成功しました！");
            setCookie("selectedClass", selectedClass, { path: "/" });
        } catch (err) {
            console.error(err);
            alert("サーバーエラーです");
        }
    }


    async function checkUserID() {
        if (!turnstileToken) {
            alert("認証トークン取得中です。しばらくお待ちください。");
            return;
        }
        try {
            const res = await fetch("/api/checkUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: inputUserID, turnstileToken }),
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
            setMessage("サーバーエラーです");
        }
    }


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
                <div>
                    <h3>立志外装部門</h3>
                    <p>1・2年生の中で最も外装がよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[0]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[0] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="0">選んでください</option>
                        <option value="1">1年A組</option>
                        <option value="2">1年B組</option>
                        <option value="3">1年C組</option>
                        <option value="4">1年D組</option>
                        <option value="5">2年A組</option>
                        <option value="6">2年B組</option>
                        <option value="7">2年C組</option>
                        <option value="8">2年D組</option>
                    </select>

                </div>
                <div>
                    <h3>開拓外装部門</h3>
                    <p>3・4年生の中で最も外装がよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[1]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[1] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="0">選んでください</option>
                        <option value="9">3年A組</option>
                        <option value="10">3年B組</option>
                        <option value="11">3年C組</option>
                        <option value="12">3年D組</option>
                        <option value="13">4年A組</option>
                        <option value="14">4年B組</option>
                        <option value="15">4年C組</option>
                        <option value="16">4年D組</option>
                    </select>

                </div>
                <div>
                    <h3>創作外装部門</h3>
                    <p>5・6年生の中で最も外装がよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[2]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[2] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="0">選んでください</option>
                        <option value="17">5年A組</option>
                        <option value="18">5年B組</option>
                        <option value="19">5年C組</option>
                        <option value="20">5年D組</option>
                        <option value="21">6年A組</option>
                        <option value="22">6年B組</option>
                        <option value="23">6年C組</option>
                        <option value="24">6年D組</option>
                    </select>

                </div>
                <div>
                    <h3>光庭パネル立志部門</h3>
                    <p>1～2年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[3]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[3] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="0">選んでください</option>
                        <option value="1">1年A組</option>
                        <option value="2">1年B組</option>
                        <option value="3">1年C組</option>
                        <option value="4">1年D組</option>
                        <option value="5">2年A組</option>
                        <option value="6">2年B組</option>
                        <option value="7">2年C組</option>
                        <option value="8">2年D組</option>
                    </select>
                </div>

                <div>
                    <h3>光庭パネル開拓部門</h3>
                    <p>3～4年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[4]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[4] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="0">選んでください</option>
                        <option value="9">3年A組</option>
                        <option value="10">3年B組</option>
                        <option value="11">3年C組</option>
                        <option value="12">3年D組</option>
                        <option value="13">4年A組</option>
                        <option value="14">4年B組</option>
                        <option value="15">4年C組</option>
                        <option value="16">4年D組</option>
                    </select>
                </div>

                <div>
                    <h3>光庭パネル創作部門</h3>
                    <p>5・6年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[5]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[5] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="0">選んでください</option>
                        <option value="17">5年A組</option>
                        <option value="18">5年B組</option>
                        <option value="19">5年C組</option>
                        <option value="20">5年D組</option>
                        <option value="21">6年A組</option>
                        <option value="22">6年B組</option>
                        <option value="23">6年C組</option>
                        <option value="24">6年D組</option>
                    </select>
                </div>


                <button
                    onClick={submitVote}
                    className="mt-3 px-4 py-1 bg-blue-600 text-white rounded"
                >
                    投票する
                </button>


            </div>
            {message && <p className="mt-2">{message}</p>}

        </div>
    );
}
