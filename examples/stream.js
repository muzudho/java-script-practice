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

// ボディ・バッファー（Body buffer；本文バッファー）
let bodyBuffer = [];

// タグ・バッファー（Tag buffer）
let tagBuffer = [];

// ステート（State；状態）
//
// * 'B' - 本文
// * 'T' - タグ
let state = "B";

// 本文を出力し、本文バッファーをフラッシュ（Flush；洗い流す，空にする）
let flushBody = () => {
    if (1 <= bodyBuffer.length) {
        text = bodyBuffer.join("");
        console.log(`flushBody:(${text})`);
    }
    bodyBuffer = [];
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

            // 本文バッファーをフラッシュ
            flushBody();
        }

        // 状態
        switch (state) {
            case "B":
                if (char === "<") {
                    tagBuffer.push(char);
                } else {
                    bodyBuffer.push(char);
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
    case "B":
        flushBody();
        break;

    case "T":
        flushTag();
        break;
}

// 期待する出力
// ==========
//
// flushBody:(これはテストだぜ)
// flushTag:(<br>)
// flushBody:(ストリームの練習だぜ)
// flushTag:(<br>)
// flushBody:(わはは草)
// flushTag:(<br>)
// flushBody:(ひょひょひょ)
// flushTag:(<br>)
// flushBody:(ぷーん)
// flushTag:(<br>)
// flushBody:(ぷーん)
// flushTag:(<br>)
