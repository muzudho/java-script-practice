// エグザンプル・コード
// =================
//
// - ストリームで送られてくる文字を　バッファリング（Buffering；溜める）　する仕組みの理解用。実用には、もう一工夫要る
// - 本文をすぐ出力したい場合のエグザンプル

// データ・ライク・ア・ストリーム（Data like a stream；ストリームのようなデータ）
//
// - 様々な <br> の断片のテスト
let daatLikeAStream = [
    "こ",
    "れは",
    "テ",
    "ス",
    "トだ",
    "ぜ",
    "<", // 「<」
    "b",
    "r",
    ">", // 「>」
    "スト",
    "リ",
    "ーム",
    "の",
    "練習",
    "だ",
    "ぜ<", // 「ぜ<」
    "br",
    ">わ", //「>わ」
    "は",
    "は",
    "草",
    "<b", // 「<b」
    "r>", // 「r>」
    "ひょ",
    "ひょひ",
    "ょ<b", // 「ょ<b」
    "r>ぷ", // 「r>ぷ」
    "ーん<br>ぷーん<br>", // 「ーん<br>ぷーん<br>」
];

// タグ・バッファー（Tag buffer）
let tagBuffer = [];

// ステート（State；状態）
//
// * 'B' - 本文
// * 'T' - タグ
let state = "B";

// 本文はすぐ出力
let writeBody = (text) => {
    console.log(`writeBody:(${text})`);
};

// タグを出力し、タグ・バッファーをフラッシュ（Flush；洗い流す，空にする）
let flushTag = () => {
    if (1 <= tagBuffer.length) {
        text = tagBuffer.join("");
        console.log(`flushTag:(${text})`);
    }
    tagBuffer = [];
};

// 細切れの　フラグメント（Fragment；断片）
for (const fragment of daatLikeAStream) {
    // キャラクターズ（Characters；複数の文字）
    //
    // - もっと分解しよう
    characters = fragment.split("");

    for (const char of characters) {
        // （事前）状態遷移
        if (char === "<") {
            state = "T";
        }

        // 状態
        switch (state) {
            case "B":
                if (char === "<") {
                    tagBuffer.push(char);
                } else {
                    writeBody(char);
                }
                break;

            case "T":
                tagBuffer.push(char);
                break;
        }

        // （事後）状態遷移
        if (char === ">") {
            state = "B";

            // タグ・バッファーをフラッシュ
            flushTag();
        }
    }
}

// 残っているり物をフラッシュ
// 状態
switch (state) {
    case "T":
        flushTag();
        break;
}

// 期待する出力
// ==========
//
// writeBody:(こ)
// writeBody:(れ)
// writeBody:(は)
// writeBody:(テ)
// writeBody:(ス)
// writeBody:(ト)
// writeBody:(だ)
// writeBody:(ぜ)
// flushTag:(<br>)
// writeBody:(ス)
// writeBody:(ト)
// writeBody:(リ)
// writeBody:(ー)
// writeBody:(ム)
// writeBody:(の)
// writeBody:(練)
// writeBody:(習)
// writeBody:(だ)
// writeBody:(ぜ)
// flushTag:(<br>)
// writeBody:(わ)
// writeBody:(は)
// writeBody:(は)
// writeBody:(草)
// flushTag:(<br>)
// writeBody:(ひ)
// writeBody:(ょ)
// writeBody:(ひ)
// writeBody:(ょ)
// writeBody:(ひ)
// writeBody:(ょ)
// flushTag:(<br>)
// writeBody:(ぷ)
// writeBody:(ー)
// writeBody:(ん)
// flushTag:(<br>)
// writeBody:(ぷ)
// writeBody:(ー)
// writeBody:(ん)
// flushTag:(<br>)
