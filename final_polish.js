import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const fixList = [
    {
        id: 10, // 木
        kun_sentence: [
            { "text": "[庭](にわ)に[大](おお)きな[木](き)がある。", "mean": "마당에 큰 나무가 있다." },
            { "text": "[木](こ)[陰](かげ)で[休](やす)む。", "mean": "나무 그늘에서 쉬다." }
        ]
    },
    {
        id: 12, // 山
        kun_sentence: [
            { "text": "[富士](ふじ)[山](さん)は[高](たか)い[山](やま)だ。", "mean": "후지산은 높은 산이다." },
            { "text": "[山](やま)[嵐](あらし)を見つけた。", "mean": "호저(산미치광이)를 발견했다." } // or just use different context
        ]
    },
    {
        id: 302, // 探 (Already fixed, but checking)
    },
    {
        id: 307, // 振 (Already fixed)
    },
    {
        id: 308, // 描 (Already fixed)
    }
];

// Apply specific fixes for known important kanji
fixList.forEach(f => {
    const item = data.find(p => p.id === f.id);
    if (item && f.kun_sentence) item.kun_sentence = f.kun_sentence;
    if (item && f.on_sentence) item.on_sentence = f.on_sentence;
});

// Final check: automatic (음독)/(훈독) labeling for EVERY entry
// This ensures consistency across the whole file.
data.forEach(p => {
    p.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
            // katakana in reading typically means ON (if provided in that format)
            // But here all readings are hiragana. 
            // We'll use the phonetic match logic from before but more robustly.
            const onReadings = p.on_reading.split(/[,/]/).map(r => r.trim().toLowerCase());
            const kunReadings = p.kun_reading.split(/[,/.]/).map(r => r.trim().toLowerCase());

            // Heuristic: If word is a multi-kanji compound, it's usually ON.
            // If it ends with okurigana, it's KUN.
            const isCompound = ex.word.length >= 2 && !/[ぁ-ん]/.test(ex.word);

            if (isCompound) {
                ex.mean += ' (음독)';
            } else {
                ex.mean += ' (훈독)';
            }
        }
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Final polish applied.');
