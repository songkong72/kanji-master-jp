const fs = require('fs');
const d = require('./src/data/kanjiData.json');
let missingKun = d.filter(k => k.kun_reading !== '-' && k.kun_reading && !k.examples.some(e => e.mean && (e.mean.includes('(훈독)') || e.mean.includes('(숙자훈)'))));
console.log('Sample kun sentences of missing:');
console.log(JSON.stringify(missingKun.slice(0, 5).map(k => ({ kanji: k.kanji, kun_reading: k.kun_reading, kun_sentence: k.kun_sentence, examples: k.examples })), null, 2));
