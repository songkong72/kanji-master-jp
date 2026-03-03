const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

data.forEach(d => {
    if (d.kanji === '劭') {
        d.on_sentence = { "text": "[劭勉](しょうべん)して[栄光](えいこう)を[掴](つか)む。", "mean": "힘써 노력하여 영광을 거머쥐다." };
        d.kun_sentence = { "text": "[一生懸命](いっしょうけんめい)[職務](しょくむ)に[劭](つと)める。", "mean": "열심히 직무에 힘쓰다." };
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log('Fixed exactly 劭.');
