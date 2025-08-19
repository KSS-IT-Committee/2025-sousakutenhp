import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Supabaseクライアントのインポート
import { CookiesProvider, useCookies } from "react-cookie";



export default function VoteForm() {
    const [selectedClass, setSelectedClass] = useState([0, 0, 0, 0]);
    const [message, setMessage] = useState("");
    const [inputUserID, setInputUserID] = useState("");
    const [userID, setuserID] = useState("");
    const [cookies, setCookie] = useCookies(["userID", "selectedClass"]);
    // TODO: UserIDが設定された後にのみ投票できるようにする
    // TODO: SelectedClassをcookieに保存して、ページリロード後も選択を保持する

    useEffect(() => {
        if (cookies.userID != null) {
            setuserID(cookies.userID);
            setInputUserID(cookies.userID);
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
    }, [cookies.userID, cookies.selectedClass]);

    
    const handleVote = async () => {

        for (let i = 0; i < selectedClass.length; i++) {
            //すでに投票されているか確認
            const { data, error } = await supabase
                .from("votes")
                .select('user_id')
                .eq('user_id', cookies.userID ? Number(cookies.userID) : userID)
                .eq('category_id', i + 1)
                .limit(1);
            console.log(`部門${i + 1}のSELECT結果:`, data);
            setMessage(""); // メッセージをリセット
            if (error) {
                setMessage(`部門${i + 1}のSELECT時にエラーが発生しました: ${error.message}`);
            }
            else if (data && data.length > 0) {
                if (selectedClass[i] == 0) {
                    //投票を削除
                    const { res, error } = await supabase.from("votes").delete().eq('user_id', Number(userID)).eq('category_id', i + 1);
                    if (error) {
                        setMessage(`部門${i + 1}のDELETE時にエラーが発生しました: ${error.message}`);
                    } else {
                        setMessage("投票DELETE完了しました！");
                    }
                }
                else {

                    // 投票を更新
                    const { res, error } = await supabase.from("votes").update({
                        class_id: selectedClass[i],
                        category_id: i + 1,
                        user_id: userID,
                    }).eq('user_id', Number(userID)).eq('category_id', i + 1);

                    if (error) {
                        setMessage(`部門${i + 1}のUPDATE時にエラーが発生しました: ${error.message}`);
                    } else {
                        setMessage("投票UPDATE完了しました！");
                    }
                }

            }
            else {
                if (selectedClass[i] != 0) {
                    //新たに行を追加
                    const res = await supabase.from("votes").insert({
                        class_id: selectedClass[i],
                        category_id: i + 1,
                        user_id: userID,
                    });
                    if (res.error) {
                        setMessage(`部門${i + 1}のINSERT時にエラーが発生しました: ${res.error.message}`);
                    } else {
                        setMessage("投票INSERT完了しました！");
                    }
                }

            }

            setCookie("selectedClass", selectedClass, { path: "/" });

        }


    };


    const updateUserID = async (newUserID) => {
        const { data, error } = await supabase
            .from("users")
            .select('user_id')
            .eq('user_id', Number(newUserID))
            .limit(1);

        if (error) {
            setMessage(`エラーが発生しました: ${error.message}`);
        } else if (data && data.length > 0) {
            setuserID(newUserID);
            setCookie("userID", newUserID, { path: "/" });
            setMessage("投票IDが登録されました！");
        } else {
            setMessage(`この投票ID：${newUserID}は登録されていません。`);
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
                        onClick={() => updateUserID(inputUserID)}
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
                            newArr[0] = Number(e.target.value);
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="">選んでください</option>
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
                            newArr[1] = Number(e.target.value);
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="">選んでください</option>
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
                            newArr[2] = Number(e.target.value);
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="">選んでください</option>
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
                    <h3>光庭パネル部門</h3>
                    <p>1～6年生の中で最も光庭パネルがよかったクラスを選んでください</p>
                    <select
                        value={selectedClass[3]}
                        onChange={(e) => {
                            const newArr = [...selectedClass];
                            newArr[3] = Number(e.target.value);
                            setSelectedClass(newArr);
                        }}
                        className="mt-2 p-1 border"
                    >
                        <option value="">選んでください</option>
                        <option value="1">1年A組</option>
                        <option value="2">1年B組</option>
                        <option value="3">1年C組</option>
                        <option value="4">1年D組</option>
                        <option value="5">2年A組</option>
                        <option value="6">2年B組</option>
                        <option value="7">2年C組</option>
                        <option value="8">2年D組</option>
                        <option value="9">3年A組</option>
                        <option value="10">3年B組</option>
                        <option value="11">3年C組</option>
                        <option value="12">3年D組</option>
                        <option value="13">4年A組</option>
                        <option value="14">4年B組</option>
                        <option value="15">4年C組</option>
                        <option value="16">4年D組</option>
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
                    onClick={handleVote}
                    className="mt-3 px-4 py-1 bg-blue-600 text-white rounded"
                >
                    投票する
                </button>


            </div>
            {message && <p className="mt-2">{message}</p>}

        </div>
    );
}
