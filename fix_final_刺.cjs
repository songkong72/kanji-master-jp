const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

data.forEach(d => {
    if (d.kanji === '刺') {
        d.on_sentence = { "text": "[刺激](しげき)[的](てき)な[体験](たいけん)を[求](もと)める。", "mean": "자극적인 체험을 원하다." };
        d.examples[1].reading = "さしみ";
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log('Fixed exactly the last N2: 刺');
