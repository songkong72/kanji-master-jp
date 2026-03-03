const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// Massive Diversity Map for N1/N2
const massDiversity = {
    // 扫 (N3) - Fixing diversity
    "掃": [{ word: "掃除", reading: "そうじ", mean: "청소 (음)" }, { word: "掃く", reading: "はく", mean: "쓸다 (훈)" }],
    // ... adding more N1/N2
    "採": [{ word: "採用", reading: "さいよう", mean: "채용 (음)" }, { word: "採る", reading: "도루", mean: "뽑다 (훈)" }],
    "描": [{ word: "描写", reading: "びょうしゃ", mean: "묘사 (음)" }, { word: "描く", reading: "えがく", mean: "그리다 (훈)" }],
    "捜": [{ word: "捜査", reading: "そうさ", mean: "수사 (음)" }, { word: "捜す", reading: "さがす", mean: "찾다 (훈)" }],
    // N1 Diversity
    "姻": [{ word: "婚姻", reading: "こんいん", mean: "혼인 (음)" }, { word: "姻戚", reading: "인せき", mean: "인척 (음)" }],
    "兔": [{ word: "脱兔", reading: "だっと", mean: "달아나는 토끼 (음)" }, { word: "野兔", reading: "のうさぎ", mean: "들토끼 (훈)" }],
    "陰": [{ word: "陰気", reading: "いんき", mean: "음침함 (음)" }, { word: "木陰", reading: "こかげ", mean: "나무 그늘 (훈)" }],
    "詠": [{ word: "詠嘆", reading: "えいたん", mean: "영탄 (음)" }, { word: "詠む", reading: "よむ", mean: "읊다 (훈)" }],
    "闇": [{ word: "闇取引", reading: "야みとりひき", mean: "암거래 (훈)" }, { word: "暗闇", reading: "くらやみ", mean: "어둠 (훈)" }] // only kun possible?
};

// Auto-fixer for On/Kun diversity using heuristic
data.forEach(d => {
    if (!['N1', 'N2', 'N3'].includes(d.category)) return;

    // If it has Kun sentence but no Kun example word
    if (d.kun_sentence && d.kun_sentence.text && d.kun_reading !== '-') {
        // Try to extract word from sentence
        const match = d.kun_sentence.text.match(/\[(.*?)\]\((.*?)\)/);
        if (match && !d.examples.some(ex => ex.word.includes(match[1]))) {
            d.examples.push({ word: match[1], reading: match[2], mean: d.kun_sentence.mean });
        }
    }
});

// Deep Clean N1 Examples
data.forEach(d => {
    if (d.category === 'N1') {
        d.examples.forEach(ex => {
            ex.reading = ex.reading.replace(/[가-힣]/g, ''); // Fix Korean in reading
        });
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Automated Diversity Fix for N1-N3 complete.');
