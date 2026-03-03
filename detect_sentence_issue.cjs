const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const issues = data.filter(d => {
    if (d.category !== 'N1' && d.category !== 'N2') return false;

    // Check ON reading
    if (d.on_reading === '-' && d.on_sentence?.text) {
        // If has sentence but says not used, it's okay for now, but user might want it hidden.
        // If has sentence and does NOT say not used, it's a "Real Example Despite No Reading" error.
        if (!d.on_sentence.text.includes('使われません') && !d.on_sentence.text.includes('사용되지')) {
            return true;
        }
    }

    // Check KUN reading
    if (d.kun_reading === '-' && d.kun_sentence?.text) {
        if (!d.kun_sentence.text.includes('使われません') && !d.kun_sentence.text.includes('사용되지')) {
            return true;
        }
    }

    return false;
});

console.log(`Found ${issues.length} items where reading is '-' but has a real-looking sentence.`);
console.log(JSON.stringify(issues.map(i => ({
    kanji: i.kanji,
    category: i.category,
    on: i.on_reading,
    kun: i.kun_reading,
    on_s: i.on_sentence?.text,
    kun_s: i.kun_sentence?.text
})), null, 2));
