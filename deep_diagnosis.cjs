const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const badCases = {
    missingArrays: [], // Multiple readings but single object sentence
    unsplitRuby: [],   // [ABC](abc) formats
    badLabels: [],     // Examples missing (음독)/(훈독)
    irrelevantData: [] // Reading is '-' but sentence exists
};

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

data.forEach(d => {
    const idLabel = `${d.id}: ${d.kanji}`;

    // 1. Missing Arrays Check
    const onCount = d.on_reading === '-' ? 0 : d.on_reading.split('/').length;
    const kunCount = d.kun_reading === '-' ? 0 : d.kun_reading.split('/').length;

    if (onCount > 1 && d.on_sentence && !Array.isArray(d.on_sentence)) badCases.missingArrays.push({ id: idLabel, type: 'ON', count: onCount });
    if (kunCount > 1 && d.kun_sentence && !Array.isArray(d.kun_sentence)) badCases.missingArrays.push({ id: idLabel, type: 'KUN', count: kunCount });

    // 2. Unsplit Ruby Check
    const checkRuby = (s, field) => {
        if (!s) return;
        const texts = Array.isArray(s) ? s.map(i => i.text) : [s.text];
        texts.forEach(t => {
            const matches = t.match(/\[(.*?)\]\((.*?)\)/g);
            if (matches) {
                matches.forEach(m => {
                    const kanjis = m.match(/\[(.*?)\]/)[1];
                    if (kanjis.length > 1) badCases.unsplitRuby.push({ id: idLabel, field, ruby: m });
                });
            }
        });
    };
    checkRuby(d.on_sentence, 'on_sentence');
    checkRuby(d.kun_sentence, 'kun_sentence');

    // 3. Bad Labels Check
    if (d.examples) {
        d.examples.forEach(ex => {
            if (!ex.mean.endsWith('(음독)') && !ex.mean.endsWith('(훈독)') && !ex.mean.endsWith('(음/훈독)')) {
                badCases.badLabels.push({ id: idLabel, word: ex.word, mean: ex.mean });
            }
        });
    }

    // 4. Irrelevant Data Check
    if ((d.on_reading === '-' || !d.on_reading) && d.on_sentence !== null) badCases.irrelevantData.push({ id: idLabel, type: 'ON' });
    if ((d.kun_reading === '-' || !d.kun_reading) && d.kun_sentence !== null) badCases.irrelevantData.push({ id: idLabel, type: 'KUN' });
});

console.log('--- DETAILED GUIDELINE VIOLATION REPORT ---');
console.log('1. Missing Arrays (Multi-reading mismatch):', badCases.missingArrays.length);
console.log('2. Unsplit Ruby Blocks:', badCases.unsplitRuby.length);
console.log('3. Bad/Missing Labels in Examples:', badCases.badLabels.length);
console.log('4. Irrelevant Sentences (No reading but has sentence):', badCases.irrelevantData.length);

console.log('\n--- SAMPLE BAD CASES (Top 10 unsplit ruby) ---');
console.log(badCases.unsplitRuby.slice(0, 10));

console.log('\n--- SAMPLE BAD CASES (Top 5 missing arrays) ---');
console.log(badCases.missingArrays.slice(0, 5));
