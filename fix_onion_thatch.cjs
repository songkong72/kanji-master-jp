const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

data.forEach(d => {
    if (d.kanji === '葱' || d.kanji === '茅') {
        d.on_reading = "-";
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Fixed Onion and Thatch.');
