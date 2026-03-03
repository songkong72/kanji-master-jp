const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const report = {
    total: 0,
    one_example_only: [],
    redundant_readings: [],
    missing_kun_example: [],
    missing_on_example: []
};

// Katakana to Hiragana helper
const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

data.forEach(d => {
    report.total++;

    const examples = d.examples || [];
    if (examples.length < 2) {
        report.one_example_only.push(d.kanji);
    }

    if (d.on_reading !== '-' && d.kun_reading !== '-') {
        const onHira = d.on_reading.split(',').map(r => k2h(r.trim().toLowerCase()));
        const kunPrefixes = d.kun_reading.split('/').map(r => r.split('.')[0].trim());

        let hasOn = false;
        let hasKun = false;
        const readingsSeen = new Set();

        examples.forEach(ex => {
            readingsSeen.add(ex.reading);
            if (onHira.some(p => ex.reading.startsWith(p))) hasOn = true;
            if (kunPrefixes.some(p => ex.reading.startsWith(p))) hasKun = true;
        });

        // Diversity Check
        if (!hasOn && d.on_reading !== '-') report.missing_on_example.push(`${d.kanji} (${d.category})`);
        if (!hasKun && d.kun_reading !== '-') report.missing_kun_example.push(`${d.kanji} (${d.category})`);
        if (readingsSeen.size < examples.length) {
            report.redundant_readings.push(d.kanji);
        }
    }
});

console.log('--- GLOBAL DIVERSITY AUDIT (N1-N5) ---');
console.log('Total Kanjis:', report.total);
console.log('Kanjis with only 1 example word:', report.one_example_only.length);
console.log('Kanjis missing ON example:', report.missing_on_example.length);
console.log('Kanjis missing KUN example:', report.missing_kun_example.length);
console.log('Kanjis with redundant readings in examples:', report.redundant_readings.length);

fs.writeFileSync('full_diversity_report.json', JSON.stringify(report, null, 2));
