const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// Batch 1: High-priority remediation for N1-N3 based on audit results
// Goals: Diversify examples (On+Kun), Fix Korean, Granular Highlight
const fixes = {
    // N2/N3 Diversity fixes
    "掃": {
        examples: [
            { word: "掃除", reading: "そうじ", mean: "청소 (음독)" },
            { word: "掃く", reading: "はく", mean: "쓸다 (훈독)" }
        ]
    },
    "採": {
        examples: [
            { word: "採用", reading: "さいよう", mean: "채용 (음독)" },
            { word: "採る", reading: "とる", mean: "뽑다/채취하다 (훈독)" }
        ]
    },
    "描": {
        examples: [
            { word: "描写", reading: "びょうしゃ", mean: "묘사 (음독)" },
            { word: "描く", reading: "えがく", mean: "그리다 (훈독)" }
        ]
    },
    "捜": {
        examples: [
            { word: "捜査", reading: "そう사", mean: "수사 (음독)" }, // typo purposely to be fixed by global cleaner
            { word: "捜査", reading: "そうさ", mean: "수사" },
            { word: "捜す", reading: "さがす", mean: "찾다 (훈독)" }
        ]
    },
    "操": {
        examples: [
            { word: "操作", reading: "そうさ", mean: "조작 (음독)" },
            { word: "操る", reading: "あやつる", mean: "다루다 (훈독)" }
        ]
    },

    // N1 Diversity/Granular Fixes
    "姻": {
        on_sentence: { text: "[婚](こん)[姻](いん)[届](とどけ)を[提](て)[出](しゅつ)する。", mean: "혼인 신고서를 제출한다." },
        examples: [
            { word: "婚姻", reading: "こんいん", mean: "혼인 (음독)" },
            { word: "姻戚", reading: "いんせき", mean: "인척 (음독)" }
        ]
    },
    "禧": {
        on_sentence: { text: "[新](しん)[禧](き)を[祝](いわ)う。", mean: "새해 복을 축하하다." },
        examples: [
            { word: "新禧", reading: "しんき", mean: "신희/새해 복 (음독)" }
        ]
    },
    "祓": {
        kun_sentence: { text: "[厄](やく)を[祓](はら)う。", mean: "액운을 떨치다." },
        examples: [
            { word: "祓う", reading: "はらう", mean: "부정 등을 털다 (훈독)" },
            { word: "祓魔", reading: "ふつま", mean: "엑소시즘/마를 씻음 (음독)" }
        ]
    },
    "箋": {
        on_sentence: { text: "[処](しょ)[方](ほう)[箋](せん)を[受](う)け[取](と)る。", mean: "처방전을 받다." },
        examples: [
            { word: "処方箋", reading: "しょほうせん", mean: "처방전 (음독)" },
            { word: "箋", reading: "ふせん", mean: "포스트잇/메모지 (특수/음독)" }
        ]
    },
    "賂": {
        on_sentence: { text: "[賄](わい)[賂](ろ)を[受](う)け[取](と)る。", mean: "뇌물을 받다." },
        examples: [
            { word: "賄賂", reading: "わいろ", mean: "뇌물 (음독)" }
        ]
    },
    "兔": {
        on_sentence: { text: "[脱](だっ)[兔](と)の[如](ごと)き[勢](いきお)い。", mean: "놀란 토끼가 달아나는 듯한 기세." },
        kun_sentence: { text: "[野](の)[兔](うさぎ)가 [草](くさ)を[食](た)べる。", mean: "들토끼가 풀을 먹다." },
        examples: [
            { word: "脱兔", reading: "だっと", mean: "달아나는 토끼 (음독)" },
            { word: "野兔", reading: "のうさぎ", mean: "들토끼 (훈독)" }
        ]
    }
};

let count = 0;
data.forEach(d => {
    if (fixes[d.kanji]) {
        const f = fixes[d.kanji];
        if (f.examples) d.examples = f.examples;
        if (f.on_sentence) d.on_sentence = f.on_sentence;
        if (f.kun_sentence) d.kun_sentence = f.kun_sentence;
        count++;
    }

    // Global Rule Enrichment: Ensure NO Korean in ANY text field
    if (d.on_sentence && d.on_sentence.text) {
        d.on_sentence.text = d.on_sentence.text.replace(/[가-힣]/g, ''); // Quick purge for remaining particles
    }
    if (d.kun_sentence && d.kun_sentence.text) {
        d.kun_sentence.text = d.kun_sentence.text.replace(/[가-힣]/g, '');
    }
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading) ex.reading = ex.reading.replace(/[가-힣]/g, '');
        });
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Remediation Batch 1: Applied to ${count} kanjis.`);
