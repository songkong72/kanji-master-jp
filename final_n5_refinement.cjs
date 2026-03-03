const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Hardcoded representative words for common N5 multi-readings to ensure guideline 2-1 & 2-2
const extraExamples = {
    5: [{ word: "四", reading: "よん", mean: "넷 (훈독)" }],
    7: [{ word: "六つ", reading: "むっつ", mean: "여섯 개 (훈독)" }],
    8: [{ word: "七つ", reading: "ななつ", mean: "일곱 개 (훈독)" }],
    9: [{ word: "八つ", reading: "やっつ", mean: "여덟 개 (훈독)" }],
    10: [{ word: "九つ", reading: "ここのつ", mean: "아홉 개 (훈독)" }],
    11: [{ word: "十", reading: "とお", mean: "열 (훈독)" }]
};

data.forEach(d => {
    if (extraExamples[d.id]) {
        extraExamples[d.id].forEach(ex => {
            if (!d.examples.some(e => e.reading === ex.reading)) {
                d.examples.push(ex);
            }
        });
    }

    // Ensure sentences are arrays if readings have /
    if (d.on_reading.includes('/') && d.on_sentence && !Array.isArray(d.on_sentence)) {
        d.on_sentence = [d.on_sentence];
    }
    if (d.kun_reading.includes('/') && d.kun_sentence && !Array.isArray(d.kun_sentence)) {
        d.kun_sentence = [d.kun_sentence];
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Final refinement for N5 multi-reading examples complete.");
