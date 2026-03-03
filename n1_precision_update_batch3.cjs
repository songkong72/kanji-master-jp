const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const n1Batch3 = {
    "拐": {
        on_sentence: { text: "[誘](ゆう)[拐](かい)사[件](けん)が[発](はっ)[生](せい)した。", mean: "유괴 사건이 발생했다." },
        examples: [
            { word: "유괴", reading: "ゆうかい", mean: "유괴" }
        ]
    },
    "崖": {
        kun_sentence: { text: "[崖](がけ)から[海](うみ)を[見](み)[下](お)ろす。", mean: "낭떠러지에서 바다를 내려다보다." },
        examples: [
            { word: "断崖", reading: "だんがい", mean: "단애/절벽 (음독)" },
            { word: "崖崩れ", reading: "がけくずれ", mean: "산사태/절벽 붕괴 (훈독)" }
        ]
    },
    "顎": {
        kun_sentence: { text: "[顎](あご)を[出](だ)して[走](はし)る。", mean: "턱을 내밀고 달리다(몹시 지치다)." },
        examples: [
            { word: "顎関節", reading: "がくかんせつ", mean: "턱관절 (음독)" },
            { word: "二重顎", reading: "にじゅうあご", mean: "이중턱 (훈독)" }
        ]
    },
    "骸": {
        on_sentence: { text: "[骸](がい)[骨](こつ)が[発](はっ)[掘](こつ)された。", mean: "해골이 발굴되었다." },
        kun_sentence: { text: "[死](し)[骸](むくろ)を[手](て)[厚](あつ)く[葬](ほうむ)る。", mean: "시신을 정중히 장사지내다." },
        examples: [
            { word: "骸骨", reading: "がいこつ", mean: "해골 (음독)" },
            { word: "形骸", reading: "けいがい", mean: "형해 (음독)" },
            { word: "死骸", reading: "むくろ", mean: "시체 (훈독)" }
        ]
    },
    "柿": {
        kun_sentence: { text: "[柿](かき)の[実](み)が[赤](あか)く[熟](う)れる。", mean: "감 열매가 빨갛게 익다." },
        examples: [
            { word: "吊るし柿", reading: "つるしがき", mean: "곶감 (훈독)" },
            { word: "柿色", reading: "かきいろ", mean: "감색 (훈독)" }
        ]
    },
    "葛": {
        on_sentence: { text: "[葛](かっ)[藤](とう)を[乗](の)り[越](こ)える。", mean: "갈등을 극복하다." },
        kun_sentence: { text: "[葛](くず)の[根](ね)から[粉](こな)を[作](つく)る。", mean: "칡 뿌리에서 가루를 만들다." },
        examples: [
            { word: "葛藤", reading: "かっとう", mean: "갈등 (음독)" },
            { word: "葛湯", reading: "くずゆ", mean: "칡차 (훈독)" }
        ]
    },
    "釜": {
        kun_sentence: { text: "[釜](かま)の[中](なか)の[飯](めし)。", mean: "가마솥 안의 밥." },
        examples: [
            { word: "お釜", reading: "おかま", mean: "가마/밥솥 (훈독)" },
            { word: "釜山", reading: "ぷさん", mean: "부산 (지명/특수)" }
        ]
    },
    "鎌": {
        kun_sentence: { text: "[鎌](かま)で[草](くさ)を[刈](か)る。", mean: "낫으로 풀을 베다." },
        examples: [
            { word: "鎌倉", reading: "かまくら", mean: "가마쿠라 (지명)" },
            { word: "大鎌", reading: "おおがま", mean: "큰 낫" }
        ]
    },
    "粥": {
        kun_sentence: { text: "[風](か)[邪](ぜ)を[引](ひ)いたので[粥](かゆ)を[食](た)べる。", mean: "감기에 걸려서 죽을 먹다." },
        examples: [
            { word: "七草粥", reading: "ななくさがゆ", mean: "나나쿠사 가유 (훈독)" },
            { word: "配粥", reading: "はいしゅく", mean: "배죽/죽을 나누어 줌 (음독)" }
        ]
    },
    "玩": {
        on_sentence: { text: "[玩](がん)[具](ぐ)[屋](や)へ[行](い)く。", mean: "장난감 가게에 가다." },
        examples: [
            { word: "玩具", reading: "がんぐ", mean: "장난감 (음독)" },
            { word: "愛玩", reading: "あいがん", mean: "애완 (음독)" }
        ]
    }
};

let count = 0;
data.forEach(d => {
    if (n1Batch3[d.kanji]) {
        const b = n1Batch3[d.kanji];
        if (b.on_sentence) d.on_sentence = b.on_sentence;
        if (b.kun_sentence) d.kun_sentence = b.kun_sentence;
        if (b.examples) d.examples = b.examples;
        count++;
    }

    // Safety check for target kanji in sentences
    if (d.on_sentence && d.on_sentence.text) d.on_sentence.text = d.on_sentence.text.replace(/[가-힣]/g, '');
    if (d.kun_sentence && d.kun_sentence.text) d.kun_sentence.text = d.kun_sentence.text.replace(/[가-힣]/g, '');
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`N1 Batch 3 Update (10 kanjis) complete.`);
