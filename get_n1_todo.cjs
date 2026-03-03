const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));
const n1 = data.filter(d =>
    d.category === 'N1' && (!d.on_sentence?.text || d.on_sentence.text.length < 10)
);
fs.writeFileSync('n1_todo.json', JSON.stringify(n1.map(d => d.kanji), null, 2));
console.log('N1 to-do count:', n1.length);
