const fs = require('fs');
const path = './kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Fix missing Kun examples
const fixes = {
    // Common N3 kanji missing examples
    '救': { word: '[救](すく)う', reading: 'すくう', mean: '구하다 (훈독)' },
    '敏': { word: '[敏](さと)い', reading: 'さとい', mean: '민첩하다 (훈독)' }, // wait 敏 kun is actually '' in n3 ? 敏(さと.い) isn't in kun reading list. I will only fix 救 for now.
};

let count = 0;
data.forEach(d => {
    if (d.kanji === '救' && !d.examples.some(e => e.mean.includes('(훈독)'))) {
        d.examples.push({
            word: '[救](すく)う',
            reading: 'すくう',
            mean: '구하다 (훈독)'
        });
        count++;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed', count, 'items');
