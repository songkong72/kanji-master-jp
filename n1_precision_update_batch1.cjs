const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const n1Batch = {
    "挨": {
        on_sentence: { text: "[挨](あい)[拶](さつ)を[交](か)わす。", mean: "인사를 나누다." },
        examples: [
            { word: "挨拶", reading: "あいさつ", mean: "인사" }
        ]
    },
    "拶": {
        on_sentence: { text: "[挨](あい)[拶](さつ)は[社](しゃ)[会](かい)[人](じん)の[基](き)[本](ほん)だ。", mean: "인사는 사회인의 기본이다." },
        examples: [
            { word: "挨拶", reading: "あいさつ", mean: "인사" }
        ]
    },
    "宛": {
        on_sentence: { text: "[宛](えん)[転](てん)たる[語](ご)[口](くち)。", mean: "원활하고 유창한 말투." },
        kun_sentence: { text: "[親](おや)[友](ゆう)[宛](あ)てに[手](て)[紙](がみ)を[書](か)く。", mean: "친한 친구 앞으로 편지를 쓰다." },
        examples: [
            { word: "宛名", reading: "あてな", mean: "수취인 성명 (훈독)" },
            { word: "宛転", reading: "えんてん", mean: "원활함/유창함 (음독)" }
        ]
    },
    "嵐": {
        kun_sentence: { text: "[嵐](あらし)の[前](まえ)の[静](しず)けさ。", mean: "폭풍전야의 정막." },
        examples: [
            { word: "嵐", reading: "あらし", mean: "폭풍우 (훈독)" },
            { word: "青嵐", reading: "あおあらし", mean: "푸른 잎 사이로 부는 바람 (음/훈 혼합)" },
            { word: "山嵐", reading: "やまあらし", mean: "산바람/호저 (훈독)" }
        ]
    },
    "彙": {
        on_sentence: { text: "[語](ご)[彙](い)を[豊](ゆた)かにする。", mean: "어휘를 풍부하게 하다." },
        examples: [
            { word: "語彙", reading: "ごい", mean: "어휘" }
        ]
    },
    "椅": {
        on_sentence: { text: "[椅](い)[子](す)に[座](すわ)って[本](ほん)を[読](よ)む。", mean: "의자에 앉아 책을 읽다." },
        examples: [
            { word: "椅子", reading: "いす", mean: "의자" }
        ]
    },
    "畏": {
        kun_sentence: { text: "[神](かみ)を[畏](おそ)れる。", mean: "신을 두려워하다." },
        examples: [
            { word: "畏怖", reading: "いふ", mean: "경외심/두려움 (음독)" },
            { word: "畏まる", reading: "かしこまる", mean: "황송해하다/정중히 대하다 (훈독)" }
        ]
    },
    "咽": {
        on_sentence: { text: "[咽](いん)[喉](こう)が[痛](いた)い。", mean: "인후가 아프다." },
        kun_sentence: { text: "[煙](けむり)に[咽](むせ)ぶ。", mean: "연기에 숨이 막히다." },
        examples: [
            { word: "咽喉", reading: "いんこう", mean: "인후 (음독)" },
            { word: "咽ぶ", reading: "むせぶ", mean: "목이 메다/숨막히다 (훈독)" }
        ]
    },
    "淫": {
        on_sentence: { text: "[淫](いん)[乱](らん)な[行](こう)[為](い)を[慎](つつ)しむ。", mean: "음란한 행위를 삼가다." },
        kun_sentence: { text: "[酒](さけ)に[淫](みだ)れる。", mean: "술에 빠지다/음란해지다." },
        examples: [
            { word: "淫ら", reading: "みだら", mean: "음란함 (훈독)" },
            { word: "淫靡", reading: "いんび", mean: "음비함 (음독)" }
        ]
    },
    "陰": {
        on_sentence: { text: "[陰](いん)[陽](よう)의 [調](ちょう)[和](わ)를 [考](かん)[が](が)える。", mean: "음양의 조화를 생각하다." }, // will be fixed by cleaner
        on_sentence: { text: "[陰](いん)[陽](よう)の[調](ちょう)[和](わ)を[考](かん)がえる。", mean: "음양의 조화를 생각하다." },
        kun_sentence: { text: "[木](き)の[陰](かげ)で[休](やす)む。", mean: "나무 그늘에서 쉬다." },
        examples: [
            { word: "日陰", reading: "ひかげ", mean: "그늘 (훈독)" },
            { word: "陰気", reading: "いんき", mean: "음침함 (음독)" }
        ]
    },
    "詠": {
        on_sentence: { text: "[詠](えい)[嘆](たん)の[声](こえ)を[漏](も)らす。", mean: "영탄의 소리를 흘리다(감탄하다)." },
        kun_sentence: { text: "[和](わ)[歌](か)を[詠](よ)む。", mean: "와카를 읊다." },
        examples: [
            { word: "詠む", reading: "よむ", mean: "읊다 (훈독)" },
            { word: "詠唱", reading: "えいしょう", mean: "영창 (음독)" }
        ]
    },
    "闇": {
        kun_sentence: { text: "[一](いち)[寸](すん)[先](さき)は[闇](やみ)だ。", mean: "한 치 앞은 어둠이다." },
        examples: [
            { word: "暗闇", reading: "くらやみ", mean: "어둠 (훈독)" },
            { word: "闇取引", reading: "やみとりひき", mean: "암거래 (훈독)" }
        ]
    }
};

let count = 0;
data.forEach(d => {
    if (n1Batch[d.kanji]) {
        const b = n1Batch[d.kanji];
        if (b.on_sentence) d.on_sentence = b.on_sentence;
        if (b.kun_sentence) d.kun_sentence = b.kun_sentence;
        if (b.examples) d.examples = b.examples;
        count++;
    }
});

// Final global polish
data.forEach(d => {
    if (d.on_sentence && d.on_sentence.text) d.on_sentence.text = d.on_sentence.text.replace(/[가-힣]/g, '');
    if (d.kun_sentence && d.kun_sentence.text) d.kun_sentence.text = d.kun_sentence.text.replace(/[가-힣]/g, '');
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`N1 Batch Update (12 kanjis) complete.`);
