const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

// 1. Correction Map for known errors found in visual check
const manualFixes = {
    5: { // 四
        kun_sentence: [
            { "text": "[四](よっ)つあります。", "mean": "네 개 있습니다." },
            { "text": "[今](きょ)[日](う)、[四](よん)[時](じ)に[来](く)る。", "mean": "오늘, 4시에 온다." }
        ]
    }
};

let fixCount = 0;
data.forEach(d => {
    let changed = false;

    // Apply manual fixes
    if (manualFixes[d.id]) {
        Object.assign(d, manualFixes[d.id]);
        changed = true;
    }

    // Global cleanup: Fix Korean particles in ALL sentences
    const pMap = { '에': '에', '가': '가', '은': 'は', '는': 'は', '을': 'を', '를': '를', '이': 'い' }; // wait, Korean!
    const pMapFixed = { '에': '에', '가': '가', '은': 'は', '는': 'は', '을': 'を', '를': '를', '이': 'い' };

    // Safety first: Replace specific common OCR errors
    const cleanS = (s) => {
        if (!s) return;
        const proc = (i) => {
            const old = i.text;
            // Correct '에' to 'に' ONLY if it's following a ruby or kanji loosely
            i.text = i.text.replace(/([\)\]])에(?=[\s\.,!|]|$)/g, '$1に');
            i.text = i.text.replace(/([\)\]])가(?=[\s\.,!|]|$)/g, '$1が');
            if (i.text !== old) changed = true;
        };
        if (Array.isArray(s)) s.forEach(proc);
        else proc(s);
    };
    cleanS(d.on_sentence);
    cleanS(d.kun_sentence);

    // Labeling diversity check (Ensure at least one ON and one KUN examples if both readings exist)
    if (d.on_reading !== '-' && d.kun_reading !== '-' && d.examples && d.examples.length >= 2) {
        const onP = d.on_reading.split('/').map(r => k2h(r.trim().toLowerCase()).split('.')[0]);
        const kunP = d.kun_reading.split('/').map(r => r.trim().toLowerCase().split('.')[0]);

        let hasOn = d.examples.some(ex => onP.some(p => ex.reading.startsWith(p)));
        let hasKun = d.examples.some(ex => kunP.some(p => ex.reading.startsWith(p)));

        if (!hasOn || !hasKun) {
            // Priority fix for common N5-N4
            if (d.id === 11) { // 十
                d.examples = [
                    { "word": "十月", "reading": "じゅうがつ", "mean": "시월 (음독)" },
                    { "word": "十日", "reading": "とおか", "mean": "십일 (훈독)" }
                ];
                changed = true;
            }
        }
    }

    if (changed) fixCount++;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Final precision fix complete for ${fixCount} entries.`);
