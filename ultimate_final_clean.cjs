const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const updates = {
    "兇": {
        "on_sentence": { "text": "[兇悪](きょうあく)な[事件](じけん)が[発生](はっせい)した。", "mean": "흉악한 사건이 발생했다." },
        "kun_sentence": notUsedKun
    },
    "勁": {
        "on_sentence": { "text": "[彼](かれ)は[強勁](きょうけい)な[意志](いし)を[持](も)っている。", "mean": "그는 강인한 의지를 가지고 있다." },
        "kun_sentence": notUsedKun
    },
    "劭": {
        "on_sentence": { "text": "[劭勉](しょうべん)して[功](いさお)を[立](た)てる。", "mean": "힘써 노력하여 공을 세우다." },
        "kun_sentence": { "text": "[一生懸命](いっしょうけんめい)[学業](がくぎょう)に[劭](つと)める。", "mean": "열심히 학업에 힘쓰다." }
    },
    "葱": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[料理](りょうり)に[刻](きざ)んだ[葱](ねぎ)を[入](い)れる。", "mean": "요리에 다진 파를 넣다." }
    },
    "虧": {
        "on_sentence": { "text": "[利益](りえき)が[虧損](きそん)するのを[防](ふせ)ぐ。", "mean": "이익이 결손되는 것을 막다." },
        "kun_sentence": { "text": "[月](つき)が[満](み)ち[虧](か)けする。", "mean": "달이 차고 기울다." }
    },
    "襯": {
        "on_sentence": { "text": "[肌](はだ)[襯](じゅばん)を[着](き)て[寒](さむ)さを[凌](しの)ぐ。", "mean": "속저고리를 입어 추위를 견디다." },
        "kun_sentence": { "text": "[着物](きもの)の[下](した)に[襯](したぎ)を[付](つ)ける。", "mean": "기모노 밑에 속옷을 입다." }
    },
    "禳": {
        "on_sentence": { "text": "[災](わざわ)いを[禳](はら)うための[儀式](ぎしき)。", "mean": "재앙을 쫓기 위한 의식." },
        "kun_sentence": notUsedKun
    },
    "尻": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[椅子](いす)に[深](ふか)く[尻](しり)を[据](す)える。", "mean": "의자에 깊숙이 엉덩이를 붙이다." }
    },
    "喋": {
        "on_sentence": { "text": "[朝](あさ)から[晩](ばん)まで[喋々](ちょうちょう)と[話](はな)す。", "mean": "아침부터 밤까지 조잘조잘(첩첩) 이야기하다." },
        "kun_sentence": { "text": "[彼](かれ)はとてもよく[喋](しゃべ)る。", "mean": "그는 무척이나 잘 재잘거린다(말한다)." }
    },
    "爪": {
        "on_sentence": { "text": "[爪牙](そうが)をむいて[襲](おそ)いかかる。", "mean": "조아(손톱과 어금니)를 드러내고 달려들다." },
        "kun_sentence": { "text": "[深](ふか)[爪](づめ)をしないよう[注意](ちゅうい)する。", "mean": "손톱을 너무 바짝 깎지 않도록 주의하다." }
    },
    "鶴": {
        "on_sentence": { "text": "[千羽鶴](せんばづる)を[折](お)って[無事](ぶじ)を[祈](いの)る。", "mean": "종이학 천 마리를 접어 무사를 빈다." },
        "kun_sentence": { "text": "[空](そら)を[鶴](つる)が[舞](ま)っている。", "mean": "하늘에 두루미가 춤추고 있다." }
    },
    "鼎": {
        "on_sentence": { "text": "[三](さん)[者](しゃ)が[鼎立](ていりつ)する[状態](じょうたい)。", "mean": "세 사람이 정립(솥발처럼 셋이 섬)하는 상태." },
        "kun_sentence": { "text": "[古](ふる)い[青銅](せいどう)の[鼎](かなえ)を[見](み)る。", "mean": "오래된 청동 정(솥)을 보다." }
    },
    "犠": {
        "on_sentence": { "text": "[尊](とうと)い[犠牲](ぎせい)を[払](はら)って[平和](へいわ)を[得](え)る。", "mean": "숭고한 희생을 치르고 평화를 얻다." },
        "kun_sentence": notUsedKun
    }
};

let count = 0;
data.forEach(d => {
    if (updates[d.kanji]) {
        d.on_sentence = updates[d.kanji].on_sentence;
        d.kun_sentence = updates[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Absolutely final clean of remaining 13 problematic kanjis: ${count}.`);
