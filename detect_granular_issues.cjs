const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const issues = [];
data.forEach(d => {
    if (d.category !== 'N1' && d.category !== 'N2') return;

    const sentences = [d.on_sentence?.text, d.kun_sentence?.text].filter(t => t);
    sentences.forEach(s => {
        const rubyParts = s.match(/\[(.*?)\]\((.*?)\)/g) || [];
        rubyParts.forEach(p => {
            const m = p.match(/\[(.*?)\]\((.*?)\)/);
            if (m && m[1].length > 1 && m[1].includes(d.kanji)) {
                issues.push({ kanji: d.kanji, category: d.category, sentence: s, part: p });
            }
        });
    });
});

console.log(`Found ${issues.length} items with multi-kanji target blocks.`);
console.log(JSON.stringify(issues.slice(0, 20), null, 2));
fs.writeFileSync('granular_issues.json', JSON.stringify(issues, null, 2));
