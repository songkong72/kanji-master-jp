const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

let fixCount = 0;

data.forEach(d => {
    let changed = false;

    // 1. Analyze readings
    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => r.trim());
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim());

    const onHira = ons.map(r => k2h(r.toLowerCase()).split('.')[0]);
    const kunHira = kuns.map(r => r.toLowerCase().split('.')[0]);

    // 2. Map existing examples to readings
    const coverage = { on: new Set(), kun: new Set() };
    if (d.examples) {
        d.examples.forEach(ex => {
            onHira.forEach((p, i) => { if (ex.reading.startsWith(p)) coverage.on.add(i); });
            kunHira.forEach((p, i) => { if (ex.reading.startsWith(p)) coverage.kun.add(i); });
        });
    }

    // 3. Array Conversion for multi-readings (MANDATORY)
    if (ons.length > 1 && d.on_sentence && !Array.isArray(d.on_sentence)) {
        d.on_sentence = [d.on_sentence];
        changed = true;
    }
    if (kuns.length > 1 && d.kun_sentence && !Array.isArray(d.kun_sentence)) {
        d.kun_sentence = [d.kun_sentence];
        changed = true;
    }

    if (changed) fixCount++;
});

// Specific fix for ID 5 (四) - User requested 'second' kun reading example
const id5 = data.find(k => k.id === 5);
if (id5) {
    // Current examples: 四月(ON), 四日(KUN1)
    // Add KUN2 (よん)
    if (!id5.examples.some(ex => ex.reading === 'よん')) {
        id5.examples.push({ word: "四", reading: "よん", mean: "넷 (훈독)" });
    }
}

// Specific fix for ID 6 (五)
const id6 = data.find(k => k.id === 6);
if (id6 && id6.examples.length < 3) {
    id6.examples.push({ word: "五人", reading: "ごにん", mean: "다섯 사람 (음독)" });
}

// Global Cleanup for any remaining Korean particles or readings
const kMap = { '나': 'な', '다': 'だ', '무': 'む', '시': 'し', '의': 'の', '카': 'か', '오': 'お', '루': 'る', '이': 'い', '에': 'え' };
data.forEach(d => {
    ['on_reading', 'kun_reading'].forEach(f => {
        if (d[f]) d[f] = d[f].replace(/[가-힣]/g, m => kMap[m] || m);
    });
    if (d.examples) {
        d.examples.forEach(ex => {
            ex.word = ex.word.replace(/[가-힣]/g, m => kMap[m] || m);
            ex.reading = (ex.reading || '').replace(/[가-힣]/g, m => kMap[m] || m);
        });
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Updated ${data.length} entries for quality standards.`);
