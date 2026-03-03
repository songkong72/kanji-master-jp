const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const issues = [];
data.forEach(d => {
    if ((d.on_reading === '-' || !d.on_reading) && d.on_sentence !== null) {
        issues.push({ id: d.id, kanji: d.kanji, issue: 'Missing On-reading but has On-sentence' });
    }
    if ((d.kun_reading === '-' || !d.kun_reading) && d.kun_sentence !== null) {
        issues.push({ id: d.id, kanji: d.kanji, issue: 'Missing Kun-reading but has Kun-sentence' });
    }
});

console.log('Total issues found:', issues.length);
if (issues.length > 0) {
    console.log(JSON.stringify(issues, null, 2));
}
