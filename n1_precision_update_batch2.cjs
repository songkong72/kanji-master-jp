const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const n1Batch2 = {
    "隠": {
        on_sentence: { text: "[証](しょう)[拠](きょ)を[隠](いん)[滅](めつ)する。", mean: "증거를 인멸하다." },
        kun_sentence: { text: "[姿](すがた)を[隠](かく)す。", mean: "모습을 숨기다." },
        examples: [
            { word: "隠居", reading: "いんきょ", mean: "은거 (음독)" },
            { word: "隠れる", reading: "かくれる", mean: "숨다 (훈독)" }
        ]
    },
    "臼": {
        kun_sentence: { text: "[石](いし)[臼](うす)で[粉](こな)を[挽](ひ)く。", mean: "맷돌(석구)로 가루를 갈다." },
        examples: [
            { word: "石臼", reading: "いしうす", mean: "맷돌 (훈독)" },
            { word: "臼蓋", reading: "きゅうがい", mean: "절구공이/비구 (음독)" }
        ]
    },
    "浦": {
        kun_sentence: { text: "[浦](うら)[里](さと)の[風](ふう)[景](けい)。", mean: "바닷가 마을의 풍경." },
        examples: [
            { word: "浦里", reading: "うらさと", mean: "바닷가 마을 (훈독)" },
            { word: "三浦", reading: "みうら", mean: "미우라 (지명/성씨 - 훈독)" }
        ]
    },
    "餌": {
        kun_sentence: { text: "[魚](さかな)に[餌](えさ)を[与](あた)える。", mean: "물고기에게 먹이를 주다." },
        examples: [
            { word: "餌食", reading: "えじき", mean: "먹잇감 (훈독)" },
            { word: "薬餌", reading: "やくじ", mean: "약과 음식/치료 (음독)" }
        ]
    },
    "怨": {
        on_sentence: { text: "[怨](えん)[恨](こん)を[買](か)う。", mean: "원한을 사다." },
        kun_sentence: { text: "[世](よ)を[怨](うら)む。", mean: "세상을 원망하다." },
        examples: [
            { word: "怨恨", reading: "えんこん", mean: "원한 (음독)" },
            { word: "怨念", reading: "おんねん", mean: "원념 (음독/변칙)" },
            { word: "怨む", reading: "うらむ", mean: "원망하다 (훈독)" }
        ]
    },
    "艶": {
        on_sentence: { text: "[艶](えん)[麗](れい)な[姿](すがた)。", mean: "염려한(매우 고운) 모습." },
        kun_sentence: { text: "[肌](はだ)に[艶](つや)がある。", mean: "피부에 윤기가 있다." },
        examples: [
            { word: "艶やか", reading: "あでやか", mean: "아리땁다/요염하다 (훈독)" },
            { word: "艶色", reading: "えんしょく", mean: "염색/관능적인 색 (음독)" }
        ]
    },
    "旺": {
        on_sentence: { text: "[食](しょく)[欲](よく)が[旺](おう)[盛](せい)だ。", mean: "식욕이 왕성하다." },
        examples: [
            { word: "旺盛", reading: "おうせい", mean: "왕성함" }
        ]
    },
    "岡": {
        kun_sentence: { text: "[静](しず)かな[岡](おか)の[上](うえ)。", mean: "조용한 언덕 위." },
        examples: [
            { word: "岡山", reading: "おかやま", mean: "오카야마 (지명)" },
            { word: "福岡", reading: "ふくおか", mean: "후쿠오카 (지명)" }
        ]
    },
    "臆": {
        on_sentence: { text: "[臆](おく)[病](びょう)な[性](せい)[格](かく)。", mean: "겁이 많은 성격." },
        examples: [
            { word: "臆病", reading: "おくびょう", mean: "겁쟁이" },
            { word: "臆測", reading: "おくそく", mean: "억측" }
        ]
    },
    "俺": {
        kun_sentence: { text: "[俺](おれ)の[言](い)うことを[聞](き)け。", mean: "내 말을 들어라." },
        examples: [
            { word: "俺等", reading: "おれたち", mean: "우리들" }
        ]
    }
};

let count = 0;
data.forEach(d => {
    if (n1Batch2[d.kanji]) {
        const b = n1Batch2[d.kanji];
        if (b.on_sentence) d.on_sentence = b.on_sentence;
        if (b.kun_sentence) d.kun_sentence = b.kun_sentence;
        if (b.examples) d.examples = b.examples;
        count++;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`N1 Batch 2 Update (10 kanjis) complete.`);
