const fs = require('fs');
const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

let fixCount = 0;

data.forEach(d => {
    if (d.kun_reading === '-' || !d.kun_reading) {
        if (Array.isArray(d.kun_sentence) || (d.kun_sentence && d.kun_sentence.text !== '-')) {
            d.kun_sentence = { text: "-", mean: "-" };
            fixCount++;
        }
    }

    if (d.on_reading === '-' || !d.on_reading) {
        if (Array.isArray(d.on_sentence) || (d.on_sentence && d.on_sentence.text !== '-')) {
            d.on_sentence = { text: "-", mean: "-" };
            fixCount++;
        }
    }
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log(`Reverted sentences for emojis with no reading: ${fixCount}`);
