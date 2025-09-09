import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";

type ApiResponse =
    | { success: true }
    | { success: false; error: string };

type CheckUserResponse =
    | { success: true; exists: true }
    | { success: true; exists: false }
    | { success: false; error: string };

declare global {
    interface Window {
        turnstile: {
            render: (element: string | HTMLElement, options: any) => number;
            execute: (widgetId: number) => void;
            reset: (widgetId: number) => void;
        };
    }
}

export default function VoteForm() {
    const [selectedClass, setSelectedClass] = useState(["0", "0", "0", "0", "0", "0"]);
    const [message, setMessage] = useState("");
    const [inputUserID, setInputUserID] = useState("");
    const [userID, setUserID] = useState("");
    const [cookies, setCookie] = useCookies(["userID", "selectedClass"]);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileWidgetId = useRef<number | null>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const sitekey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim();

    // Cookie から復元
    useEffect(() => {
        if (cookies.userID) {
            setInputUserID(cookies.userID);
            // ユーザーIDは投票時にチェック
        }
        if (cookies.selectedClass) {
            try {
                let arr = cookies.selectedClass;
                if (typeof arr === "string") arr = JSON.parse(arr);
                if (Array.isArray(arr)) setSelectedClass(arr);
            } catch { }
        }
    }, []);

    // Turnstile をレンダリング
    useEffect(() => {
        console.log(window.turnstile, turnstileRef.current, sitekey);
        if (window.turnstile && turnstileRef.current && sitekey) {
            turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
                sitekey,
                callback: (token: string) => setTurnstileToken(token),
            });
        }

    }, [sitekey]);

    // Turnstile トークンを取得してからユーザーIDチェック
    async function handleCheckUserID() {
        if (!turnstileWidgetId.current) return alert("Turnstile が未初期化です");
        setMessage("検証中...");
        // execute でトークン発行
        window.turnstile.reset(turnstileWidgetId.current); // 念のためリセット
        setTurnstileToken(null);
        window.turnstile.execute(turnstileWidgetId.current);

        // トークンがセットされるのを待つ
        const waitToken = () =>
            new Promise<string>((resolve, reject) => {
                const timeout = setTimeout(() => reject("Turnstile タイムアウト"), 10000);
                const interval = setInterval(() => {
                    if (turnstileToken) {
                        clearTimeout(timeout);
                        clearInterval(interval);
                        resolve(turnstileToken);
                    }
                }, 100);
            });

        try {
            const token = await waitToken();
            setMessage("サーバーと通信中...");
            const res = await fetch("/api/checkUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: inputUserID, turnstileToken: token }),
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
        } catch (err) {
            console.error(err);
            setMessage("Turnstile 認証またはサーバーエラーです");
        } finally {

            setTurnstileToken(null); // トークンは使い切り
        }
    }

    // 投票送信
    async function handleSubmitVote() {
        if (!userID) return alert("投票IDが未登録です");
        if (!turnstileWidgetId.current) return alert("Turnstile が未初期化です");
        setMessage("検証中...");
        // execute でトークン発行
        window.turnstile.reset(turnstileWidgetId.current); // 念のためリセット
        setTurnstileToken(null);
        window.turnstile.execute(turnstileWidgetId.current);

        const waitToken = () =>
            new Promise<string>((resolve, reject) => {
                const timeout = setTimeout(() => reject("Turnstile タイムアウト"), 10000);
                const interval = setInterval(() => {
                    if (turnstileToken) {
                        clearTimeout(timeout);
                        clearInterval(interval);
                        resolve(turnstileToken);
                    }
                }, 100);
            });

        try {
            const token = await waitToken();
            setMessage("サーバーと通信中...");
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
                if (!data.success) {
                    setMessage("投票に失敗しました：" + data.error);
                    return;
                }
            }
            setMessage("投票に成功しました！");
            setCookie("selectedClass", selectedClass, { path: "/" });
        } catch (err) {
            console.error(err);
            setMessage("Turnstile 認証またはサーバーエラーです");
        } finally {
            setTurnstileToken(null); // トークンは使い切り
        }
    }
    return (
        <div className="vote-container">
            <div ref={turnstileRef} className="turnstile-container"></div>
            <div className="user-id-section">
                <p className="message-text">{message}</p>
                <div className="user-id-input-group">
                    <h2>投票ID</h2>
                    <input
                        type="text"
                        value={inputUserID}
                        onChange={(e) => setInputUserID(e.target.value)}
                        className="user-id-input"
                    />
                    <button
                        className="user-id-button"
                        onClick={handleCheckUserID}
                    >
                        ID登録
                    </button>
                </div>
            </div>
            <div className="voting-section">
                <p className="voting-title">それぞれの部門でよいと思ったクラスを選んでください</p>
                <div className="category-section">
                    <h3 className="category-title">立志外装部門</h3>
                    <p className="category-description">1・2年生の中で最も外装がよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[0]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[0] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="category-select"
                        disabled={!userID}
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
                <div className="category-section">
                    <h3 className="category-title">開拓外装部門</h3>
                    <p className="category-description">3・4年生の中で最も外装がよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[1]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[1] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="category-select"
                        disabled={!userID}
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
                <div className="category-section">
                    <h3 className="category-title">創作外装部門</h3>
                    <p className="category-description">5・6年生の中で最も外装がよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[2]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[2] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="category-select"
                        disabled={!userID}
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
                <div className="category-section">
                    <h3 className="category-title">光庭パネル立志部門</h3>
                    <p className="category-description">1～2年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[3]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[3] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="category-select"
                        disabled={!userID}
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

                <div className="category-section">
                    <h3 className="category-title">光庭パネル開拓部門</h3>
                    <p className="category-description">3～4年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[4]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[4] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="category-select"
                        disabled={!userID}
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

                <div className="category-section">
                    <h3 className="category-title">光庭パネル創作部門</h3>
                    <p className="category-description">5・6年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[5]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[5] = e.target.value;
                            setSelectedClass(newArr);
                        }}
                        className="category-select"
                        disabled={!userID}
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
                    onClick={handleSubmitVote}
                    className="submit-button"
                    disabled={!userID}
                >
                    投票する
                </button>
            </div>
        </div>
    );
}
