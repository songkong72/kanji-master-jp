const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./kanjiData.json', 'utf8'));

let missingKunCount = 0;
let missingOnCount = 0;
let issues = [];

data.forEach(d => {
    const hasKun = d.kun_reading && d.kun_reading !== '-';
    const hasOn = d.on_reading && d.on_reading !== '-';

    const hasKunExample = d.examples.some(e => e.mean.includes('(훈독)') || e.mean.includes('(숙자훈)'));
    const hasOnExample = d.examples.some(e => e.mean.includes('(음독)'));

    if (hasKun && !hasKunExample) {
        missingKunCount++;
        issues.push({ id: d.id, kanji: d.kanji, type: 'missing_kun', kun: d.kun_reading });
    }

    if (hasOn && !hasOnExample) {
        missingOnCount++;
        issues.push({ id: d.id, kanji: d.kanji, type: 'missing_on', on: d.on_reading });
    }
});

console.log('Missing Kun Examples:', missingKunCount);
console.log('Missing On Examples:', missingOnCount);
console.log('Sample issues:', issues.slice(0, 10));

fs.writeFileSync('parity_issues.json', JSON.stringify(issues, null, 2));
