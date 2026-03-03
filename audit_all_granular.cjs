const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const issues = [];
data.forEach(d => {
    // Audit ALL levels now
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const matches = s.text.match(/\[(.*?)\]\((.*?)\)/g) || [];
        matches.forEach(m => {
            const inner = m.match(/\[(.*?)\]\((.*?)\)/);
            if (inner && inner[1].length > 1 && inner[1].includes(d.kanji)) {
                issues.push({ kanji: d.kanji, category: d.category, type: s === d.on_sentence ? 'on' : 'kun', part: m });
            }
        });
    });
});

console.log(`Found ${issues.length} instances of multi-kanji target blocks across all levels.`);
fs.writeFileSync('all_granular_issues.json', JSON.stringify(issues, null, 2));
console.log('Sample issues:', JSON.stringify(issues.slice(0, 10), null, 2));
