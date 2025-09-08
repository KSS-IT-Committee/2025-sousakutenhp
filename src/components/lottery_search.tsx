import { CookiesProvider } from "react-cookie";
import VoteForm from "./vote_form";
import React, { useState } from "react";
// gaibu_applicant_lis.jsonをインポート
import applicantList from "./gaibu_applicant_list.json";
// applicantListの中身は[{uid: "1234", status: "名前"}, ...]の形

export default function LotterySearch() {
    const [inputID, setInputID] = useState("");
    const [result, setResult] = useState("");
    function handleSerach() {
        // inputIDが数字4桁でなければアラート
        if (!/^\d{4}$/.test(inputID)) {
            setResult("4桁の数字を半角で入力してください");
            return;
        }
        // applicantListからinputIDを検索
        // もしkeyにIDがなければ
        const applicant = applicantList.find((applicant) => applicant.uid === inputID);

        if (applicant) {
            setResult(`【${applicant.uid}】<br/>${applicant.status}`);
        } else {
            setResult(`「${inputID}」は存在しません。`);
        }
    }
    return (
        <div className="lottery-search-box">
            <div className="lottery-search-row">
                <input
                    type="text"
                    placeholder="4桁の抽選番号を入力"
                    value={inputID}
                    onChange={(e) => setInputID(e.target.value)}
                    className="lottery-search-input"
                />
                <div className="lottery-search-button" onClick={handleSerach}>
                    検索
                </div>
            </div>
            <div className="lottery-search-result" dangerouslySetInnerHTML={{ __html: result }} />
        </div>
    );
}
