const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// 1. Specific Multi-Reading & Diversity Fixes (Batch A: N1/N2)
const fixes = {
    "肢": {
        on_sentence: { text: "[肢](し)[体](たい)の[不](ふ)[自](じ)[由](ゆう)な[人](ひと)を[助](たす)ける。", mean: "지체(팔다리)가 부자유스러운 사람을 돕다." },
        on_reading: "シ", kun_reading: "-", // clean phantom
        examples: [{ word: "肢体", reading: "したい", mean: "지체 (음)" }, { word: "選択肢", reading: "せんたくし", mean: "선택지 (음)" }]
    },
    "刑": {
        on_reading: "ケイ", kun_reading: "-", // clean phantom
        on_sentence: { text: "[死](し)[刑](けい)[判](はん)[決](けつ)が[下](くだ)る。", mean: "사형 판결이 내려지다." },
        examples: [{ word: "刑務所", reading: "けいむしょ", mean: "교도소" }]
    },
    // Adding variety to common ones
    "日": {
        examples: [
            { word: "日本語", reading: "にほんご", mean: "일본어 (음)" },
            { word: "毎日", reading: "まいにち", mean: "매일 (음)" },
            { word: "今日", reading: "きょう", mean: "오늘 (예외/빈도)" },
            { word: "明日", reading: "あした", mean: "내일 (예외/빈도)" }
        ]
    },
    "人": {
        examples: [
            { word: "日本人", reading: "にほんじん", mean: "일본인 (음)" },
            { word: "大人", reading: "おとな", mean: "어른 (예외/빈도)" },
            { word: "一人", reading: "ひとり", mean: "한 사람 (훈/특수)" }
        ]
    },
    "生": {
        kun_reading: "い.きる/い.かす/い.ける/う.まれる/う.む/お.う/は.える/は.やす/き/なま",
        kun_sentence: [
            { text: "[生](い)きてるだけで[丸](まる)[儲](もう)け。", mean: "살아있는 것만으로도 이득이다." },
            { text: "[生](なま)[魚](ざかな)を[食](た)べる。", mean: "생선을 먹다." },
            { text: "[生](は)え[際](ぎわ)の[白](しら)[髪](が)。", mean: "머리가 자라기 시작하는 부분의 흰머리." }
        ]
    },
    "探": {
        examples: [
            { word: "探求", reading: "たんきゅう", mean: "탐구 (음)" },
            { word: "探す", reading: "さがす", mean: "찾다 (훈)" }
        ]
    },
    "殺": {
        on_sentence: [
            { text: "[殺](さつ)[人](じん)[事](じ)[件](けん)。", mean: "살인 사건." },
            { text: "[殺](さい)[生](しょう)を[戒](いまし)める。", mean: "살생을 경계(금지)하다." }
        ],
        kun_sentence: { text: "[虫](むし)を[殺](ころ)す。", mean: "벌레를 죽이다." },
        examples: [
            { word: "殺人", reading: "さつじん", mean: "살인 (음1)" },
            { word: "殺生", reading: "さいしょう", mean: "살생 (음2)" },
            { word: "殺す", reading: "ころす", mean: "죽이다 (훈)" }
        ]
    }
};

let count = 0;
data.forEach(d => {
    if (fixes[d.kanji]) {
        Object.assign(d, fixes[d.kanji]);
        count++;
    }

    // Global: Split any remaining multi-kanji ruby tags to ensure granular highlighting
    const splitRuby = (str) => {
        return str.replace(/\[((?!\]).{2,})\]\((.*?)\)/g, (match, kanjis, read) => {
            // Heuristic: if lengths match, split 1:1. Otherwise keep unless manual fix.
            if (kanjis.length === read.length) {
                let res = '';
                for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${read[i]})`;
                return res;
            }
            return match;
        });
    };

    if (d.on_sentence) {
        if (Array.isArray(d.on_sentence)) d.on_sentence.forEach(s => s.text = splitRuby(s.text));
        else d.on_sentence.text = splitRuby(d.on_sentence.text);
    }
    if (d.kun_sentence) {
        if (Array.isArray(d.kun_sentence)) d.kun_sentence.forEach(s => s.text = splitRuby(s.text));
        else d.kun_sentence.text = splitRuby(d.kun_sentence.text);
    }
});

// Final Polish: Clean all Korean particles from ALL sentence entries
data.forEach(d => {
    const fields = ['on_sentence', 'kun_sentence'];
    fields.forEach(f => {
        if (d[f]) {
            const arr = Array.isArray(d[f]) ? d[f] : [d[f]];
            arr.forEach(s => {
                if (s.text) s.text = s.text.replace(/[가-힣]/g, '');
            });
        }
    });
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading) ex.reading = ex.reading.replace(/[가-힣]/g, '');
        });
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Phase 1 Polish complete: Updated ${count} complex kanjis and cleaned global data.`);
