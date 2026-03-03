const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const files = fs.readdirSync('./').filter(f => f.startsWith('add_bulk_') && f.endsWith('.cjs'));

let rawDataStore = [];
files.forEach(script => {
    const content = fs.readFileSync(script, 'utf8');
    const match = content.match(/const rawData = \[([\s\S]*?)\];/);
    if (match) {
        try {
            const arrText = `[${match[1]}]`;
            const arr = eval(arrText);
            rawDataStore = rawDataStore.concat(arr);
        } catch (e) {
            console.error('Failed to parse', script);
        }
    }
});

let updateCount = 0;
let existingKanjiMap = new Map();
data.forEach((k, idx) => { existingKanjiMap.set(k.kanji, idx); });

rawDataStore.forEach(row => {
    let [kanji, meaning, on, kun, cat, sub, exp, wordsRaw, onSentRaw, kunSentRaw] = row.split('|');

    let ex = [];
    if (wordsRaw && wordsRaw !== "-,-") wordsRaw.split(';').forEach(wPart => { let [word, reading, mean] = wPart.split(','); if (word) ex.push({ word, reading, mean }); });
    let os = [];
    if (onSentRaw && onSentRaw !== "-,-") onSentRaw.split(';').forEach(sPart => { let [text, mean] = sPart.split(','); if (text) os.push({ text, mean }); });
    let ks = [];
    if (kunSentRaw && kunSentRaw !== "-,-") kunSentRaw.split(';').forEach(sPart => { let [text, mean] = sPart.split(','); if (text) ks.push({ text, mean }); });

    if (existingKanjiMap.has(kanji)) {
        let idx = existingKanjiMap.get(kanji);
        let existing = data[idx];

        let needsUpdate = false;

        if (existing.examples) {
            let hasRuby = existing.examples.every(e => e && e.word && e.word.includes('['));
            if (!hasRuby || existing.examples.length < ex.length) needsUpdate = true;
            let isSingle = existing.examples.some(e => e && e.word && e.word.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').length === 1);
            if (isSingle) needsUpdate = true;
        } else {
            needsUpdate = true;
        }

        if (existing.on_sentence && existing.on_sentence.some(s => s && s.text && (s.text.includes('と[読](よ)む') || s.text.length < 5))) needsUpdate = true;
        if (existing.kun_sentence && existing.kun_sentence.some(s => s && s.text && (s.text.includes('と[読](よ)む') || s.text.length < 5))) needsUpdate = true;

        if (needsUpdate || !existing.on_sentence || existing.on_sentence.length === 0) {
            existing.on_reading = on;
            existing.kun_reading = kun;
            existing.category = cat;
            existing.subcategory = sub;
            existing.explanation = exp;
            existing.examples = ex;
            existing.on_sentence = os;
            existing.kun_sentence = ks;
            updateCount++;
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updateCount} existing kanji that had sparse data!`);
