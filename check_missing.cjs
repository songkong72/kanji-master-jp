const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json'));
let missing = 0;
d.forEach(k => k.examples.forEach(ex => {
    if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) missing++;
}));
console.log('Missing labels:', missing);
