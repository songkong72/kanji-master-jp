const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

// 1. Core Cleanup Dictionary
const korMap = {
    '나': 'な', '다': 'だ', '무': 'む', '시': 'し', '의': 'の', '카': 'か', '오': 'お', '루': 'る',
    '이': 'い', '에': 'に', '가': 'が', '은': 'は', '는': 'は', '을': 'を', '를': '를', '기': 'き',
    '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ', '마': 'ま', '미': 'み', '메': 'め', '모': 'も'
};

// 2. Advanced Ruby Splitter Logic
const splitRuby = (text, readings) => {
    if (!text) return text;
    // Normalize readings for matching
    const allReadings = readings.map(r => k2h(r.toLowerCase().split('.')[0]));

    return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
        if (kanjis.length > 1) {
            // Priority 1: 1:1 match
            if (kanjis.length === read.length) return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');

            // Priority 2: Try to match a known reading for the FIRST kanji
            for (const r of allReadings) {
                if (read.startsWith(r) && read.length > r.length) {
                    const firstKanji = kanjis[0];
                    const restKanjis = kanjis.substring(1);
                    const restRead = read.substring(r.length);
                    // Recurse for the rest
                    return `[${firstKanji}](${r})` + splitRuby(`[${restKanjis}](${restRead})`, readings);
                }
            }

            // Priority 3: Common patterns (2 kanji, 3-4 read)
            if (kanjis.length === 2) {
                if (read.length === 3) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
                if (read.length === 4) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
            }
        }
        return full;
    });
};

let fixes = 0;
data.forEach(d => {
    let changed = false;
    const readings = [...(d.on_reading === '-' ? [] : d.on_reading.split('/')), ...(d.kun_reading === '-' ? [] : d.kun_reading.split('/'))];

    // Clean Readings
    ['on_reading', 'kun_reading'].forEach(f => {
        if (/[가-힣]/.test(d[f])) {
            d[f] = d[f].replace(/[가-힣]/g, m => korMap[m] || m);
            changed = true;
        }
    });

    // Clean Sentences
    const processS = (s) => {
        if (!s) return;
        const proc = (i) => {
            const old = i.text;
            // A. Ruby splitting
            i.text = splitRuby(i.text, readings);
            // B. Korean remove
            i.text = i.text.replace(/\[(.*?)\]\((.*?)\)/g, (f, k, r) => `[${k}](${r.replace(/[가-힣]/g, m => korMap[m] || m)})`);
            // C. Particle cleaning (conservative)
            i.text = i.text.replace(/([\)\]])에(?=[\s\.,!|]|$)/g, '$1に');
            i.text = i.text.replace(/([\)\]])가(?=[\s\.,!|]|$)/g, '$1が');
            if (i.text !== old) changed = true;
        };
        if (Array.isArray(s)) s.forEach(proc);
        else proc(s);
    };
    processS(d.on_sentence);
    processS(d.kun_sentence);

    // Clean Examples & Diversity
    if (d.examples) {
        d.examples.forEach(ex => {
            const old = ex.reading + ex.mean;
            ex.reading = ex.reading.replace(/[가-힣]/g, m => korMap[m] || m);
            // Standardize label
            if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
                const onH = (d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => k2h(r.trim().toLowerCase()).split('.')[0]));
                if (onH.some(p => ex.reading.startsWith(p))) ex.mean += ' (음독)';
                else ex.mean += ' (훈독)';
            }
            if (ex.reading + ex.mean !== old) changed = true;
        });
    }

    // Force array for multi-reading
    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/');
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/');
    if (ons.length > 1 && d.on_sentence && !Array.isArray(d.on_sentence)) { d.on_sentence = [d.on_sentence]; changed = true; }
    if (kuns.length > 1 && d.kun_sentence && !Array.isArray(d.kun_sentence)) { d.kun_sentence = [d.kun_sentence]; changed = true; }

    if (changed) fixes++;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Global Standard Sweep Complete. ${fixes} entries processed.`);
