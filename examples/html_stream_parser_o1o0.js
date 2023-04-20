// HTML ストリーム・パーサー
// ======================
//
// シナリオ
//
// - HTMLタグ入りの文字列が、ストリームで数文字ずつ分割して送られてくる
// - 送られてきた順に、本文およびタグを読取る

function main() {
    // テスト・データ
    // ============
    const testData = `
<font color="yellow">ローナ</font>：<br>
ありがとうございます！ぜひ食べてみてください。<br>
ご注文いただけますか？

<font color="yellow">エレノア</font>：<br>
こんにちわ、旅人さん！あたしは<strong>エレノア</strong>って言うんだよ。
ここは<strong>カーレル村</strong>だよ。
`;

    // フラグメンテーション
    // =================
    //
    // - テストデータを、数文字ずつの　フラグメント（Fragment；断片）　に分割する
    // - ストリームを模倣する
    let testDataFragments = [];
    let tempBuffer = [];
    for (const char of testData.split("")) {
        tempBuffer.push(char);
        if (0.75 <= Math.random()) {
            testDataFragments.push(tempBuffer.join(""));
            tempBuffer = [];
        }
    }
    testDataFragments.push(tempBuffer.join(""));
    tempBuffer = [];
    console.log(`
フラグメンツ
==========
${testDataFragments}
`);

    // パーサーを設定
    // ============
    //
    const streamHtmlParser = new StreamHTMLParser(
        //
        // 本文から１文字読み取った時
        // ======================
        //
        (fragment) => {
            // 出力
            console.log(`Body(${fragment})`);
        },
        //
        // タグを読み取った時
        // ===============
        //
        (sourceText, isClose) => {
            // 出力
            if (isClose) {
                // 閉じタグ
                console.log(`CloseTag(${sourceText})`);
            } else {
                // 開きタグ、または単独で使うタグ
                console.log(`Tag(${sourceText})`);
            }
        }
    );

    // 読取実験開始
    // ==========
    //
    console.log(`
読取実験開始
==========
`);
    for (const fragment of testDataFragments) {
        streamHtmlParser.append(fragment);
    }
}

/**
 * ストリーム HTML パーサー
 */
class StreamHTMLParser {
    /**
     *
     * @param {*} onCharRead - 本文を取得するイベントハンドラ
     * @param {*} onTagRead - タグを取得するイベントハンドラ
     */
    constructor(onCharRead, onTagRead) {
        this.onCharRead = onCharRead;
        this.onTagRead = onTagRead;

        // タグ・バッファー（Tag buffer）
        this.tagBuffer = [];

        // ステート（State；状態）
        //
        // * 'B' - 本文
        // * 'T' - タグ
        this.state = "B";
    }

    /**
     *
     * @param {*} fragment 細切れの　フラグメント（Fragment；断片）
     */
    append(fragment) {
        // キャラクターズ（Characters；複数の文字）
        //
        // - もっと分解しよう
        const characters = fragment.split("");

        for (const char of characters) {
            // （事前）状態遷移
            if (char === "<") {
                this.state = "T";
            }

            // 状態
            switch (this.state) {
                case "B":
                    if (char === "<") {
                        this.tagBuffer.push(char);
                    } else {
                        this.onCharRead(char);
                    }
                    break;

                case "T":
                    this.tagBuffer.push(char);
                    break;
            }

            // （事後）状態遷移
            if (char === ">") {
                this.state = "B";

                // タグ・バッファーをフラッシュ
                this.flushTag();
            }
        }
    }

    /**
     * タグを出力し、タグ・バッファーをフラッシュ（Flush；洗い流す，空にする）
     */
    flushTag() {
        if (1 <= this.tagBuffer.length) {
            const sourceText = this.tagBuffer.join("");
            const buffer = [];

            // タグ名読取
            // =========

            // １文字目は "<"
            // ２文字目が "/" なら閉じタグ
            var isClose = this.tagBuffer[1] === "/";
            if (isClose) {
                // 先頭の "</" を削る
                this.tagBuffer = this.tagBuffer.slice(2);
            } else {
                // 先頭の "<" を削る
                this.tagBuffer = this.tagBuffer.slice(1);
            }

            for (const char of this.tagBuffer) {
                if (char == " " || char == ">") {
                    break;
                } else {
                    buffer.push(char);
                }
            }

            this.onTagRead(sourceText, isClose);
        }
        this.tagBuffer = [];
    }

    /**
     * 残っているり物をフラッシュ
     */
    flush() {
        // 状態
        switch (state) {
            case "T":
                this.flushTag();
                break;
        }
    }
}

// 実行
main();
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
