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
    const [selectedClass, setSelectedClass] = useState([
        { first: "0", second: "0", third: "0" },
        { first: "0", second: "0", third: "0" },
        { first: "0", second: "0", third: "0" },
        { first: "0", second: "0", third: "0" },
        { first: "0", second: "0", third: "0" },
        { first: "0", second: "0", third: "0" }
    ]);
    const [message, setMessage] = useState("");
    const [idMessage, setIdMessage] = useState("");
    const [inputUserID, setInputUserID] = useState("");
    const [userID, setUserID] = useState("");
    const [voteSubmitted, setVoteSubmitted] = useState(false);
    const [cookies, setCookie] = useCookies(["userID", "selectedClass"]);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileWidgetId = useRef<number | null>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const sitekey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim();
    const [loading, setLoading] = useState(false);

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
                if (Array.isArray(arr)) {
                    if (arr.length > 0 && typeof arr[0] === "object") {
                        setSelectedClass(arr);
                    } else {
                        const converted = arr.map(classId => ({ first: classId, second: "0", third: "0" }));
                        setSelectedClass(converted);
                    }
                }
            } catch { }
        }
    }, []);

    // // Turnstile をレンダリング
    // useEffect(() => {
    //     console.log('Turnstile debug:', { 
    //         turnstile: window.turnstile, 
    //         ref: turnstileRef.current, 
    //         sitekey: sitekey,
    //         sitekeLength: sitekey?.length 
    //     });

    //     const initTurnstile = () => {
    //         if (window.turnstile && turnstileRef.current && sitekey) {
    //             console.log('Initializing Turnstile widget');
    //             turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
    //                 sitekey,
    //                 callback: (token: string) => {
    //                     console.log('Turnstile token received:', token.substring(0, 20) + '...');
    //                     setTurnstileToken(token);
    //                 },
    //             });
    //             console.log('Turnstile widget ID:', turnstileWidgetId.current);
    //         } else {
    //             console.log('Turnstile not ready, retrying in 100ms');
    //             setTimeout(initTurnstile, 100);
    //         }
    //     };

    //     initTurnstile();
    // }, [sitekey]);

    // Turnstile トークンを取得してからユーザーIDチェック
    async function handleCheckUserID() {
        // if (!turnstileWidgetId.current) return alert("Turnstile が未初期化です");
        // setMessage("検証中...");
        // // execute でトークン発行
        // window.turnstile.reset(turnstileWidgetId.current); // 念のためリセット
        // setTurnstileToken(null);
        // window.turnstile.execute(turnstileWidgetId.current);

        // トークンがセットされるのを待つ
        // const waitToken = () =>
        //     new Promise<string>((resolve, reject) => {
        //         const timeout = setTimeout(() => reject("Turnstile タイムアウト"), 10000);
        //         const interval = setInterval(() => {
        //             if (turnstileToken) {
        //                 clearTimeout(timeout);
        //                 clearInterval(interval);
        //                 resolve(turnstileToken);
        //             }
        //         }, 100);
        //     });

        try {
            // const token = await waitToken();
            setIdMessage("サーバーと通信中...");
            const res = await fetch("/api/checkUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: inputUserID }),
            });
            const data = (await res.json()) as CheckUserResponse;
            if (data.success) {
                if (data.exists) {
                    setUserID(inputUserID);
                    setCookie("userID", inputUserID, { path: "/" });
                    setIdMessage("投票IDが認証されました！");
                    setLoading(false);
                } else {
                    setIdMessage(`この投票ID：${inputUserID}は登録されていません。`);
                }
            } else {
                setMessage("エラー: " + data.error);
            }
        } catch (err) {
            console.error(err);
            setIdMessage("サーバーエラーです");
        } finally {

            // setTurnstileToken(null); // トークンは使い切り
        }
    }

    // 投票送信
    async function handleSubmitVote() {
        if (!userID) return alert("投票IDが未登録です");
        setLoading(true);
        // if (!turnstileWidgetId.current) return alert("Turnstile が未初期化です。しばらくお待ち下さい。");
        // setMessage("検証中...");
        // // execute でトークン発行
        // window.turnstile.reset(turnstileWidgetId.current); // 念のためリセット
        // setTurnstileToken(null);
        // window.turnstile.execute(turnstileWidgetId.current);

        // const waitToken = () =>
        //     new Promise<string>((resolve, reject) => {
        //         const timeout = setTimeout(() => reject("Turnstile タイムアウト"), 10000);
        //         const interval = setInterval(() => {
        //             if (turnstileToken) {
        //                 clearTimeout(timeout);
        //                 clearInterval(interval);
        //                 resolve(turnstileToken);
        //             }
        //         }, 100);
        //     });

        try {
            // const token = await waitToken();
            setMessage("サーバーと通信中...");
            for (let i = 0; i < selectedClass.length; i++) {
                const rankings = [
                    { rank: 1, classId: selectedClass[i].first },
                    { rank: 2, classId: selectedClass[i].second },
                    { rank: 3, classId: selectedClass[i].third }
                ];

                for (const ranking of rankings) {
                    const res = await fetch("/api/vote", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: userID,
                            categoryId: i + 1,
                            classId: ranking.classId,
                            rank: ranking.rank,
                        }),
                    });
                    const data = (await res.json()) as ApiResponse;
                    if (!data.success) {
                        setMessage("投票に失敗しました：" + data.error);
                        return;
                    }
                }
            }
            console.log("Vote submission successful, setting voteSubmitted to true");
            setMessage("投票に成功しました！");
            setVoteSubmitted(true);
            setCookie("selectedClass", selectedClass, { path: "/" });
        } catch (err) {
            console.error(err);
            setMessage("サーバーエラーです");
        } finally {
            // setTurnstileToken(null); // トークンは使い切り
        }
    }

    // 投票完了画面
    console.log("VoteForm render - voteSubmitted:", voteSubmitted);
    if (voteSubmitted) {
        return (
            <div className="vote-container">
                <div className="vote-success-screen">
                    <div className="success-icon">✅</div>
                    <h1 className="success-title">投票完了！</h1>
                    <p className="success-message">
                        投票が正常に送信されました。<br />
                        ご協力ありがとうございました！<br />
                        投票結果は適切に処理し、後日本校のイベントにて使用致します。
                    </p>
                    <div className="success-details">
                        <p><strong>投票ID:</strong> {userID}</p>
                        <p><strong>投票日時:</strong> {new Date().toLocaleString('ja-JP')}</p>
                    </div>
                    <button
                        className="back-button"
                        onClick={() => setVoteSubmitted(false)}
                    >
                        投票画面に戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="vote-container">
            <div className="user-id-section">
                {/* <p className="message-text">{message}</p> */}
                <div className="user-id-input-group">
                    <h2>投票ID</h2>
                    <div>
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
                            IDを認証する
                        </button>
                    </div>
                </div>
            </div>
            <p>{idMessage}</p>
            <div className="voting-section">
                <p className="voting-title">上記に受付にて配布されたID10桁をご入力下さい。
                    <br />IDを認証していただくと、投票するクラスを選べるようになります。
                    <br />一度にすべての項目を埋める必要はございません。複数回にわたってご入力いただくことが可能です。
                    <br />それぞれの部門で良いと思ったクラスを1位、2位、3位の順で選んでください
                    <br />同じ部門の投票について、同じクラスを複数の順位に選ぶと、投票が無効になります。ご注意下さい。</p>
                <div className="category-section">
                    <h3 className="category-title">立志外装部門</h3>
                    <p className="category-description">1・2年生の中で外装がよかったクラスを1位、2位、3位の順で選んでください</p>
                    <div className="ranking-container">
                        <div className="rank-select">
                            <label>1位</label>
                            <select
                                value={selectedClass[0].first}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[0] = { ...newArr[0], first: e.target.value };
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
                        <div className="rank-select">
                            <label>2位</label>
                            <select
                                value={selectedClass[0].second}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[0] = { ...newArr[0], second: e.target.value };
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
                        <div className="rank-select">
                            <label>3位</label>
                            <select
                                value={selectedClass[0].third}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[0] = { ...newArr[0], third: e.target.value };
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
                    </div>
                </div>
                <div className="category-section">
                    <h3 className="category-title">開拓外装部門</h3>
                    <p className="category-description">3・4年生の中で外装がよかったクラスを1位、2位、3位の順で選んでください</p>
                    <div className="ranking-container">
                        <div className="rank-select">
                            <label>1位</label>
                            <select
                                value={selectedClass[1].first}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[1] = { ...newArr[1], first: e.target.value };
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
                        <div className="rank-select">
                            <label>2位</label>
                            <select
                                value={selectedClass[1].second}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[1] = { ...newArr[1], second: e.target.value };
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
                        <div className="rank-select">
                            <label>3位</label>
                            <select
                                value={selectedClass[1].third}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[1] = { ...newArr[1], third: e.target.value };
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
                    </div>
                </div>
                <div className="category-section">
                    <h3 className="category-title">創作外装部門</h3>
                    <p className="category-description">5・6年生の中で外装がよかったクラスを1位、2位、3位の順で選んでください</p>
                    <div className="ranking-container">
                        <div className="rank-select">
                            <label>1位</label>
                            <select
                                value={selectedClass[2].first}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[2] = { ...newArr[2], first: e.target.value };
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
                        <div className="rank-select">
                            <label>2位</label>
                            <select
                                value={selectedClass[2].second}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[2] = { ...newArr[2], second: e.target.value };
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
                        <div className="rank-select">
                            <label>3位</label>
                            <select
                                value={selectedClass[2].third}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[2] = { ...newArr[2], third: e.target.value };
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
                    </div>
                </div>
                <div className="category-section">
                    <h3 className="category-title">光庭パネル立志部門</h3>
                    <p className="category-description">1～2年生の中で光庭パネルがよかったクラスを1位、2位、3位の順で選んでください</p>
                    <div className="ranking-container">
                        <div className="rank-select">
                            <label>1位</label>
                            <select
                                value={selectedClass[3].first}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[3] = { ...newArr[3], first: e.target.value };
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
                        <div className="rank-select">
                            <label>2位</label>
                            <select
                                value={selectedClass[3].second}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[3] = { ...newArr[3], second: e.target.value };
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
                        <div className="rank-select">
                            <label>3位</label>
                            <select
                                value={selectedClass[3].third}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[3] = { ...newArr[3], third: e.target.value };
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
                    </div>
                </div>

                <div className="category-section">
                    <h3 className="category-title">光庭パネル開拓部門</h3>
                    <p className="category-description">3～4年生の中で光庭パネルがよかったクラスを1位、2位、3位の順で選んでください</p>
                    <div className="ranking-container">
                        <div className="rank-select">
                            <label>1位</label>
                            <select
                                value={selectedClass[4].first}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[4] = { ...newArr[4], first: e.target.value };
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
                        <div className="rank-select">
                            <label>2位</label>
                            <select
                                value={selectedClass[4].second}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[4] = { ...newArr[4], second: e.target.value };
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
                        <div className="rank-select">
                            <label>3位</label>
                            <select
                                value={selectedClass[4].third}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[4] = { ...newArr[4], third: e.target.value };
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
                    </div>
                </div>

                <div className="category-section">
                    <h3 className="category-title">光庭パネル創作部門</h3>
                    <p className="category-description">5・6年生の中で光庭パネルがよかったクラスを1位、2位、3位の順で選んでください</p>
                    <div className="ranking-container">
                        <div className="rank-select">
                            <label>1位</label>
                            <select
                                value={selectedClass[5].first}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[5] = { ...newArr[5], first: e.target.value };
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
                        <div className="rank-select">
                            <label>2位</label>
                            <select
                                value={selectedClass[5].second}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[5] = { ...newArr[5], second: e.target.value };
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
                        <div className="rank-select">
                            <label>3位</label>
                            <select
                                value={selectedClass[5].third}
                                onChange={(e) => {
                                    const newArr = [...selectedClass];
                                    newArr[5] = { ...newArr[5], third: e.target.value };
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
                    </div>
                </div>

                <button
                    onClick={handleSubmitVote}
                    className="submit-button"
                    disabled={!userID || loading}
                >
                    投票する
                </button>
                <p>{message}</p>
                <p className="voting-title">投票にはお時間がかかる場合がございます。ボタンを押して画面が変わるまでしばらくお待ち下さい。</p>
            </div>
            {/* <div ref={turnstileRef} className="turnstile-container"></div> */}
        </div>
    );
}
