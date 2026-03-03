const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const report = [];

data.forEach(d => {
    if (!['N1', 'N2', 'N3'].includes(d.category)) return;
    if (d.on_reading === '-' || d.kun_reading === '-') return;
    if (!d.examples || d.examples.length < 2) return;

    // A simple check: do we have both On and Kun in examples?
    // This is hard to check perfectly without a dictionary of what word use what reading.
    // But we can check if the example reading starts with the listed on/kun readings.

    const onPrefixes = d.on_reading.split(',').map(r => r.trim().toLowerCase()); // Katakana usually
    const kunPrefixes = d.kun_reading.split('/').map(r => r.split('.')[0].trim()); // Hiragana

    // Convert On to Hiragana for comparison
    const katakanaToHiragana = (str) => {
        return str.replace(/[\u30a1-\u30f6]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));
    };
    const onHira = onPrefixes.map(katakanaToHiragana);

    let hasOn = false;
    let hasKun = false;

    d.examples.forEach(ex => {
        const r = ex.reading;
        if (onHira.some(p => r.startsWith(p))) hasOn = true;
        if (kunPrefixes.some(p => r.startsWith(p))) hasKun = true;
    });

    if (hasOn && !hasKun) {
        report.push(`${d.kanji} (${d.category}): Only ON examples. (Kun: ${d.kun_reading})`);
    } else if (!hasOn && hasKun) {
        report.push(`${d.kanji} (${d.category}): Only KUN examples. (On: ${d.on_reading})`);
    }
});

console.log('--- EXAMPLES DIVERSITY REPORT (N1-N3) ---');
console.log('Total problems found:', report.length);
console.log(JSON.stringify(report.slice(0, 20), null, 2));
fs.writeFileSync('diversity_audit.json', JSON.stringify(report, null, 2));
