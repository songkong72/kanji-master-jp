const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)에서는 [使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };
// REDOING: Typed '에서는' (Korean) in text. FIXING:
const cleanNotUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const updates = {
    "兇": {
        "examples": [
            { "word": "兇悪", "mean": "흉악", "reading": "きょうあく" },
            { "word": "兇器", "mean": "흉기", "reading": "きょうき" }
        ],
        "on_sentence": { "text": "[兇悪](きょうあく)な[事件](じけん)が[発生](はっせい)した。", "mean": "흉악한 사건이 발생했다." },
        "kun_sentence": cleanNotUsedKun
    },
    "勁": {
        "examples": [
            { "word": "強勁", "mean": "강인", "reading": "きょうけい" },
            { "word": "勁草", "mean": "질긴 풀(비유: 절개)", "reading": "けいそう" }
        ],
        "on_sentence": { "text": "[彼](かれ)は[強勁](きょうけい)な[意志](いし)を[持](も)いっている。", "mean": "그는 강인한 의지를 가지고 있다." },
        "kun_sentence": cleanNotUsedKun
    },
    "劭": {
        "examples": [
            { "word": "劭勉", "mean": "힘써 노력함", "reading": "しょうべん" }
        ],
        "on_sentence": { "text": "[劭勉](しょうべん)して[功](いさお)を[立](た)てる。", "mean": "힘써 노력하여 공을 세우다." },
        "kun_sentence": { "text": "[一生懸命](いっしょうけんめい)[職務](しょく무)に[劭](つと)める。", "mean": "열심히 직무에 힘쓰다." }
    },
    "虧": {
        "examples": [
            { "word": "虧損", "mean": "결손", "reading": "きそん" }
        ],
        "on_sentence": { "text": "[利益](りえき)が[虧損](きそん)するのを[防](ふせ)ぐ。", "mean": "이익이 결손되는 것을 막다." },
        "kun_sentence": { "text": "[月](つき)が[満](み)ち[虧](か)けする。", "mean": "달이 차고 기울다." }
    },
    "襯": {
        "examples": [
            { "word": "肌襯", "mean": "속저고리", "reading": "じゅばん" }
        ],
        "on_sentence": { "text": "[肌](はだ)[襯](じゅばん)を[着](き)て[寒](さむ)さを[凌](しの)ぐ。", "mean": "속저고리를 입어 추위를 견디다." },
        "kun_sentence": { "text": "[着物](きもの)の[下](した)に[襯](したぎ)を[付](つ)ける。", "mean": "기모노 밑에 속옷을 입다." }
    },
    "禳": {
        "examples": [
            { "word": "禳う", "mean": "재앙을 쫓다(불다)", "reading": "はらう" }
        ],
        "on_sentence": { "text": "[災](わざわ)いを[禳](はら)うための[儀式](ぎしき)。", "mean": "재앙을 쫓기 위한 의식." },
        "kun_sentence": cleanNotUsedKun
    },
    "尻": {
        "examples": [
            { "word": "尻馬", "mean": "남의 말 뒤를 따라감", "reading": "しりうま" }
        ],
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[椅子](いす)に[深](ふか)く[尻](しり)を[据](す)える。", "mean": "의자에 깊숙이 엉덩이를 붙이다." }
    }
};

let count = 0;
data.forEach(d => {
    if (updates[d.kanji]) {
        if (updates[d.kanji].examples) d.examples = updates[d.kanji].examples;
        d.on_sentence = updates[d.kanji].on_sentence;
        d.kun_sentence = updates[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Final final clean for exactly 7: ${count}.`);
