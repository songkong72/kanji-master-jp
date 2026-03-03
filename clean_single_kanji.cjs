const fs = require('fs');
const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

let removedCount = 0;

data.forEach(d => {
    const originalLen = d.examples.length;
    d.examples = d.examples.filter(ex => {
        // Check if the word is exactly the single kanji
        if (ex.word === d.kanji) {
            // Rule 1: It's an Onyomi reading listed as an example (usually meaningless on its own, like "シャ" for "捨")
            // If the reading is entirely katakana and it's marked as (음독)
            if (/^[\u30A0-\u30FF]+$/.test(ex.reading) && ex.mean.includes('(음독)')) {
                removedCount++;
                return false;
            }

            // Rule 2: The meaning ends in a modifier like ~할, ~일, ~를, ~을, ~치다, ~릴 (e.g., "버릴 (음독)")
            if (/([할일를을칠릴될][ \t]*\()/.test(ex.mean)) {
                removedCount++;
                return false;
            }
        }
        return true;
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log(`Removed ${removedCount} dummy single-kanji examples.`);
