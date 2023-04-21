// HTML ストリーム・パーサー エグザンプル
// ==================================
//
//
// 試行方法
// =======
//
// 👇 このファイルを、 Paiza の Webサイトで Java Script を貼り付けると、試行できる
//
// * 📖 [paiza.io](https://paiza.io/ja/projects/new?language=javascript)
//
//
// シナリオ
// =======
//
// - HTMLタグ入りの文字列が、ストリームで数文字ずつ分割して送られてくる
// - 送られてきた順に、本文およびタグを読取る
//
//
// 入力データ例
// ============
//
// - 以下のように、入力文字列をランダムな長さに細切れにしてから入力される
//
// <,fo,nt c,olor="yellow" ,si,ze="1,8">上長</,font>：,<br,>
// ちょっと,　これだけ入れ,てく,ださい　,これ,だけ,。<br,>,
// 簡,単,だから
//
// <font co,l,or,=",b,lue" siz,e="24">デベロ,ッパー</,font>,：<br,>
// ,<,s,tr,ong>納期</,s,tron,g>は伸び,るんですか？,
//
// <,f,ont colo,r="yello,w" size="1,8">,上長</font>,：,<br>
// 伸び,ない
//
//
//
// 読取例
// ======
//
// - 以下のように、タグを固まりとして取得できる
//
// Body     |
//
// Tag      | font {color=yellow, size=18} | <font color="yellow" size="18">
// Body     | 上
// Body     | 長
// CloseTag | font | </font>
// Body     | ：
// Tag      | br | <br>
// Body     |
//
// Body     | ち
// Body     | ょ
// Body     | っ
// Body     | と
// Body     |
// Body     | こ
// Body     | れ
// Body     | だ
// Body     | け
// Body     | 入
// Body     | れ
// Body     | て
// Body     | く
// Body     | だ
// Body     | さ
// Body     | い
// Body     |
// Body     | こ
// Body     | れ
// Body     | だ
// Body     | け
// Body     | 。
// Tag      | br | <br>
// Body     |
//
// Body     | 簡
// Body     | 単
// Body     | だ
// Body     | か
// Body     | ら
// Body     |
//
// Body     |
//
// Tag      | font {color=blue, size=24} | <font color="blue" size="24">
// Body     | デ
// Body     | ベ
// Body     | ロ
// Body     | ッ
// Body     | パ
// Body     | ー
// CloseTag | font | </font>
// Body     | ：
// Tag      | br | <br>
// Body     |
//
// Tag      | strong | <strong>
// Body     | 納
// Body     | 期
// CloseTag | strong | </strong>
// Body     | は
// Body     | 伸
// Body     | び
// Body     | る
// Body     | ん
// Body     | で
// Body     | す
// Body     | か
// Body     | ？
// Body     |
//
// Body     |
//
// Tag      | font {color=yellow, size=18} | <font color="yellow" size="18">
// Body     | 上
// Body     | 長
// CloseTag | font | </font>
// Body     | ：
// Tag      | br | <br>
// Body     |
//
// Body     | 伸
// Body     | び
// Body     | な
// Body     | い
// Body     |

function main() {
    // テスト・データ
    // ============
    const testData = `
<font color="yellow" size="18">上長</font>：<br>
ちょっと　これだけ入れてください　これだけ。<br>
簡単だから

<font color="blue" size="24">デベロッパー</font>：<br>
<strong>納期</strong>は伸びるんですか？

<font color="yellow" size="18">上長</font>：<br>
伸びない
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
入力データ例
============

- 以下のように、入力文字列をランダムな長さに細切れにしてから入力される

${testDataFragments}
`);

    // パーサーを設定
    // ============
    //
    const streamHtmlParser = new StreamHTMLParser(
        //
        // 本文から１文字読み取った時の処理をここに書く
        // ======================================
        //
        // * `fragment` - 読取った文字
        //
        (fragment) => {
            //
            // 出力例： Body     | あ
            //
            console.log(`Body     | ${fragment}`);
        },
        //
        // タグを読み取った時の処理をここに書く
        // ===============================
        //
        // * `sourceText` - 解析前のテキスト
        // * `isClose` - 閉じタグか？
        // * `tagName` - タグ名
        // * `attributes` - 属性の連想配列
        //
        (sourceText, isClose, tagName, attributes) => {
            // 出力
            if (isClose) {
                //
                // 閉じタグを読取った時の処理をここに書く
                // =================================
                //
                // 出力例： CloseTag | font | </font>
                //
                console.log(`CloseTag | ${tagName} | ${sourceText}`);
            } else {
                // 開きタグ、または単独で使うタグを読取った時の処理をここに書く
                // ===================================================

                // 属性の読取り方の例
                // ================
                //
                // 出力例： Tag      | font {color=yellow, size=24} | <font color="yellow" size="24">
                //
                const buffer = [];
                for (const key in attributes) {
                    buffer.push(`${key}=${attributes[key]}`);
                }
                let attributesStr = "";
                if (1 <= buffer.length) {
                    attributesStr = "{" + buffer.join(", ") + "} ";
                }
                console.log(`Tag      | ${tagName} ${attributesStr}| ${sourceText}`);
            }
        }
    );

    // 読取開始
    // ========
    //
    console.log(`
読取例
======

- 以下のように、タグを固まりとして取得できる

`);
    for (const fragment of testDataFragments) {
        streamHtmlParser.append(fragment);
    }
}

/**
 * ストリーム HTML パーサー
 *
 * - 別ファイルにしてインポートした方が便利
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
     * ストリームから読取った文字列を渡してください
     *
     * @param {*} fragment - 細切れの　フラグメント（Fragment；断片）
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
