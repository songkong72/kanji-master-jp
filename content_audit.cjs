const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const deficiencies = {
    missingSentences: [], // 발음 수 보다 예문 수가 적은 경우
    missingExampleDiversity: [] // 음/훈독이 둘 다 있는데 단어는 한 종류만 있는 경우
};

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

data.forEach(d => {
    const idLabel = `${d.id}: ${d.kanji}`;

    // 1. Sentence Deficiency Check
    const onReadings = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => r.trim());
    const kunReadings = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim());

    const onSentences = Array.isArray(d.on_sentence) ? d.on_sentence : (d.on_sentence ? [d.on_sentence] : []);
    const kunSentences = Array.isArray(d.kun_sentence) ? d.kun_sentence : (d.kun_sentence ? [d.kun_sentence] : []);

    if (onReadings.length > onSentences.length) {
        deficiencies.missingSentences.push({ id: idLabel, type: 'ON', readings: onReadings, currentSentences: onSentences.length });
    }
    if (kunReadings.length > kunSentences.length) {
        deficiencies.missingSentences.push({ id: idLabel, type: 'KUN', readings: kunReadings, currentSentences: kunSentences.length });
    }

    // 2. Example Word Diversity Check
    if (d.on_reading !== '-' && d.kun_reading !== '-' && d.examples) {
        let hasOn = false;
        let hasKun = false;
        const onHira = onReadings.map(r => k2h(r.toLowerCase()).split('.')[0]);
        const kunHira = kunReadings.map(r => r.toLowerCase().split('.')[0]);

        d.examples.forEach(ex => {
            if (onHira.some(p => ex.reading.startsWith(p))) hasOn = true;
            if (kunHira.some(p => ex.reading.startsWith(p))) hasKun = true;
        });

        if (!hasOn || !hasKun) {
            deficiencies.missingExampleDiversity.push({ id: idLabel, hasOn, hasKun });
        }
    }
});

console.log('--- CONTENT DEFICIENCY REPORT ---');
console.log('1. Kanjis missing sentences for some readings:', deficiencies.missingSentences.length);
console.log('2. Kanjis missing example word diversity (ON vs KUN):', deficiencies.missingExampleDiversity.length);

console.log('\n--- SAMPLE DEFICIENCIES (Top 10) ---');
console.log(deficiencies.missingSentences.slice(0, 10));
