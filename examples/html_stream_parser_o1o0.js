// HTML ストリーム・パーサー
// ======================
//
// シナリオ
//
// - HTMLタグ入りの文字列が、ストリームで数文字ずつ分割して送られてくる
// - 送られてきた順に、本文およびタグを読取る
//
//
// Examples
// ========
//
// 入力（以下のような、細切れの文字列）
// ------------------------------
//
// <,font color="yell,ow" ,size=",18,">ローナ,</,fo,n,t>：<br>
// あ,りがとうござ,いま,す！ぜひ食べて,み,てく,ださ,い。<br,>
// ご注文いただ,けますか？
//
// <font color=,"yellow" size="24">エ,レノ,ア,<,/font>：,<br>
// こんにちわ,、旅人,さん,！,あた,し,は<stro,ng>,エレノア<,/st,rong>,って言うんだ,よ。,
// ここ,は<,str,ong,>,カ,ーレル,村</st,r,o,ng,>だ,よ。
// ,
//
//
// コンソール出力の一例（タグを固まりとして取得できる）
// --------------------------------------------
//
// Body(
// )
// previousAttributeName:(color) nameStart:(9) previousAttributeValue:("yellow")
// Tag(<font color="yellow" size="18">) Name(font) Attributes( (color=yellow)  (size=18) )
// Body(ロ)
// Body(ー)
// Body(ナ)
// CloseTag(</font>) Name(font)
// Body(：)
// Tag(<br>) Name(br) Attributes()
// Body(
// )
// Body(あ)
// Body(り)
// Body(が)
// Body(と)
// Body(う)
// Body(ご)
// Body(ざ)
// Body(い)
// Body(ま)
// Body(す)
// Body(！)
// Body(ぜ)
// Body(ひ)
// Body(食)
// Body(べ)
// Body(て)
// Body(み)
// Body(て)
// Body(く)
// Body(だ)
// Body(さ)
// Body(い)
// Body(。)
// Tag(<br>) Name(br) Attributes()
// Body(
// )
// Body(ご)
// Body(注)
// Body(文)
// Body(い)
// Body(た)
// Body(だ)
// Body(け)
// Body(ま)
// Body(す)
// Body(か)
// Body(？)
// Body(
// )
// Body(
// )
// previousAttributeName:(color) nameStart:(9) previousAttributeValue:("yellow")
// Tag(<font color="yellow" size="24">) Name(font) Attributes( (color=yellow)  (size=24) )
// Body(エ)
// Body(レ)
// Body(ノ)
// Body(ア)
// CloseTag(</font>) Name(font)
// Body(：)
// Tag(<br>) Name(br) Attributes()
// Body(
// )
// Body(こ)
// Body(ん)
// Body(に)
// Body(ち)
// Body(わ)
// Body(、)
// Body(旅)
// Body(人)
// Body(さ)
// Body(ん)
// Body(！)
// Body(あ)
// Body(た)
// Body(し)
// Body(は)
// Tag(<strong>) Name(strong) Attributes()
// Body(エ)
// Body(レ)
// Body(ノ)
// Body(ア)
// CloseTag(</strong>) Name(strong)
// Body(っ)
// Body(て)
// Body(言)
// Body(う)
// Body(ん)
// Body(だ)
// Body(よ)
// Body(。)
// Body(
// )
// Body(こ)
// Body(こ)
// Body(は)
// Tag(<strong>) Name(strong) Attributes()
// Body(カ)
// Body(ー)
// Body(レ)
// Body(ル)
// Body(村)
// CloseTag(</strong>) Name(strong)
// Body(だ)
// Body(よ)
// Body(。)
// Body(
// )

function main() {
    // テスト・データ
    // ============
    const testData = `
<font color="yellow" size="18">ローナ</font>：<br>
ありがとうございます！ぜひ食べてみてください。<br>
ご注文いただけますか？

<font color="yellow" size="24">エレノア</font>：<br>
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
        // 本文から１文字読み取った時の処理をここに書く
        // ======================================
        //
        // * `fragment` - 読取った文字
        //
        (fragment) => {
            //
            // 出力例： Body(あ)
            //
            console.log(`Body(${fragment})`);
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
                // 出力例： CloseTag(</Font>) Name(Font)
                //
                console.log(`CloseTag(${sourceText}) Name(${tagName})`);
            } else {
                // 開きタグ、または単独で使うタグを読取った時の処理をここに書く
                // ===================================================

                // 属性の読取り方の例
                // ================
                //
                // 出力例： Tag(<font color="yellow" size="24">) Name(font) Attributes( (color=yellow)  (size=24) )
                //
                const buffer = [];
                for (const key in attributes) {
                    buffer.push(" (");
                    buffer.push(key);
                    buffer.push("=");
                    buffer.push(attributes[key]);
                    buffer.push(") ");
                }
                const attributesStr = buffer.join("");
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
