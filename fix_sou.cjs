const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const t = data.find(d => d.kanji === '捜');
if (t) {
    t.on_sentence = { text: '[犯](はん)[人](にん)の[行](ゆく)[方](え)を[捜](そう)[索](さく)する。', mean: '범인의 행방을 수색하다.' };
    t.kun_sentence = { text: '[家](いえ)の[中](なか)を[捜](さが)す。', mean: '집 안을 샅샅이 찾다.' };
    const ex = t.examples.find(e => e.word === '捜す');
    if (!ex) t.examples.push({ word: '捜す', reading: 'さがす', mean: '찾다 (훈독)' });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed 捜 sentences and examples');
}
