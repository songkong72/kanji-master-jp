const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));
const empty = data.filter(d =>
    d.category === 'N2' && (!d.on_sentence?.text || d.on_sentence.text.length < 10)
);
process.stdout.write(JSON.stringify(empty.map(d => d.kanji)));
