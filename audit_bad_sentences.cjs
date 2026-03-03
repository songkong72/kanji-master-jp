const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

let badSentencesCount = 0;
let missingLabelsCount = 0;
const badSentences = [];

data.forEach(d => {
    // Check sentences
    function checkSentence(s, type) {
        if (!s || !s.text) return;
        // Check if it's too short, or contains empty parentheses like () or ( )
        if (s.text.length < 5 || s.text.includes('()') || s.text.includes('( )') || /\[.\]\([^)]*\)[。\.]$/.test(s.text)) {
            badSentencesCount++;
            badSentences.push({ id: d.id, kanji: d.kanji, type, text: s.text, mean: s.mean });
        }
    }

    if (Array.isArray(d.on_sentence)) {
        d.on_sentence.forEach(s => checkSentence(s, 'on'));
    } else {
        checkSentence(d.on_sentence, 'on');
    }

    if (Array.isArray(d.kun_sentence)) {
        d.kun_sentence.forEach(s => checkSentence(s, 'kun'));
    } else {
        checkSentence(d.kun_sentence, 'kun');
    }

    // Check examples missing labels
    d.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)') && !ex.mean.includes('(특수)')) {
            missingLabelsCount++;
        }
    });
});

console.log(`Bad sentences found: ${badSentencesCount}`);
if (badSentencesCount > 0) {
    console.log('Sample bad sentences:', JSON.stringify(badSentences.slice(0, 10), null, 2));
}
console.log(`Missing labels in examples: ${missingLabelsCount}`);
