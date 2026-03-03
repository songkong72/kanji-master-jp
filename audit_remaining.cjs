const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const results = [];
data.forEach(d => {
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const matches = s.text.match(/\[(.*?)\]\((.*?)\)/g) || [];
        matches.forEach(m => {
            const inner = m.match(/\[(.*?)\]\((.*?)\)/);
            if (inner && inner[1].length > 1 && inner[1].includes(d.kanji)) {
                results.push({ k: d.kanji, cat: d.category, block: m });
            }
        });
    });
});

fs.writeFileSync('remaining_blocks.json', JSON.stringify(results, null, 2));
console.log('Found', results.length, 'remaining blocks.');
