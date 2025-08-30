import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Supabaseクライアントのインポート



export default function VoteForm() {
    const [selectedClass, setSelectedClass] = useState("");
    const [message, setMessage] = useState("");

    const handleVote = async () => {
        const res = await supabase.from("votes").insert({
            class_id: selectedClass,
            category_id: 1, // ここは適宜変更
            cookie_id: "example_cookie_id", // ここは適宜変更
        });

        if (res.error) {
            setMessage(`エラーが発生しました: ${res.error.message}`);
        } else {
            setMessage("投票完了しました！");
        }
    };

    return (
        <div className="p-4 border rounded">
            <h2 className="text-lg font-bold">お気に入りの展示に投票！</h2>
            <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="mt-2 p-1 border"
            >
                <option value="">選んでください</option>
                <option value="1">1年A組</option>
                <option value="2">2年B組</option>
            </select>
            <button
                onClick={handleVote}
                className="mt-3 px-4 py-1 bg-blue-600 text-white rounded"
            >
                投票する
            </button>
            {message && <p className="mt-2">{message}</p>}
        </div>
    );
}
