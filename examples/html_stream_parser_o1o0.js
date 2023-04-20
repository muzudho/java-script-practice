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
        (sourceText, isClose, tagName, attributes) => {
            // 出力
            if (isClose) {
                // 閉じタグ
                const attributesStr = JSON.stringify(attributes, null, "    ");
                console.log(`CloseTag(${sourceText}) Name(${tagName}) Attributes(${attributesStr})`);
            } else {
                // 開きタグ、または単独で使うタグ
                const attributesStr = JSON.stringify(attributes, null, "    ");
                console.log(`Tag(${sourceText}) Name(${tagName}) Attributes(${attributesStr})`);
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

            // タグ名読取
            // =========

            // １文字目は "<"
            // ２文字目が "/" なら閉じタグ
            var isClose = this.tagBuffer[1] === "/";
            if (isClose) {
                // 先頭の "</" と、末尾の ">" を削る
                this.tagBuffer = this.tagBuffer.slice(2, -1);
            } else {
                // 先頭の "<" と、末尾の ">" を削る
                this.tagBuffer = this.tagBuffer.slice(1, -1);
            }

            // 次のスペースまで（無ければ全て）が、タグ名
            let endOfName = this.tagBuffer.indexOf(" ");
            if (endOfName < 0) {
                endOfName = this.tagBuffer.length;
            }
            const tagName = this.tagBuffer.slice(0, endOfName).join("");
            const restList = this.tagBuffer.slice(endOfName);

            // 属性読取
            // =======
            //
            const attributes = {};
            let buffer = [];
            let previousAttributeName = "";

            for (const char of restList) {
                if (char == "=") {
                    // 「=」の前にある単語は「属性名」、それより前に入っているものは「属性値」
                    const text = buffer.join("");

                    let nameStart = text.lastIndexOf(" ");
                    if (nameStart < 0) {
                        nameStart = 0;
                    } else {
                        // 区切りの半角空白を読み飛ばす
                        nameStart++;
                    }

                    // 値が確定すると、１つ前の属性の名前とペアになる
                    if (previousAttributeName !== "") {
                        let previousAttributeValue = text.slice(0, nameStart).trim();
                        console.log(`previousAttributeName:(${previousAttributeName}) nameStart:(${nameStart}) previousAttributeValue:(${previousAttributeValue})`);

                        // 値の両端にダブルクォーテーションがあれば外す
                        if (previousAttributeValue[0] === '"' && previousAttributeValue[previousAttributeValue.length - 1] === '"') {
                            previousAttributeValue = previousAttributeValue.slice(1, -1);
                        }

                        // １つ前の属性が確定する
                        attributes[previousAttributeName] = previousAttributeValue;
                    }

                    // 次の属性の名前が確定する
                    previousAttributeName = text.slice(nameStart);

                    // フラッシュ
                    buffer = [];
                } else {
                    buffer.push(char);
                }
            }

            // 最後の属性の値
            if (0 < buffer.length) {
                let lastAttributeValue = buffer.join("");
                // 値の両端にダブルクォーテーションがあれば外す
                if (lastAttributeValue[0] === '"' && lastAttributeValue[lastAttributeValue.length - 1] === '"') {
                    lastAttributeValue = lastAttributeValue.slice(1, -1);
                }

                attributes[previousAttributeName] = lastAttributeValue;
            }

            // 結果
            // ====
            this.onTagRead(sourceText, isClose, tagName, attributes);
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
