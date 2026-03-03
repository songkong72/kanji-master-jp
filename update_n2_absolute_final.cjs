const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const updates = {
    "冠": {
        "on_sentence": { "text": "[王冠](おうかん)を [頭](あたま)に [載](の)せる。", "mean": "왕관을 머리에 얹다." },
        "kun_sentence": { "text": "[花](はな)の [冠](かんむり)を [作](つく)る。", "mean": "꽃 화관을 만든다." }
    },
    "刺": {
        "on_sentence": { "text": "[刺激](しげき)的(てき)な [体験](たいけん)を [求](もと)める。", "mean": "자극적인 체험을 원하다." },
        "kun_sentence": { "text": "[棘](とげ)が [刺](さ)さる。", "mean": "가시가 찔리다." }
    },
    "勲": {
        "on_sentence": { "text": "[多大](ただい)な [勲功](くんこう)を [立](た)てる。", "mean": "다대한 훈공을 세우다." },
        "kun_sentence": { "text": "[勲](いさお)を [称](たた)える。", "mean": "공훈을 치하하다." }
    },
    "蝶": {
        "on_sentence": { "text": "[優雅](ゆうが)な [胡蝶](こちょう)の [舞](まい)。", "mean": "우아한 호접의 춤." },
        "kun_sentence": { "text": "[菜](な)の[花](はな)に [蝶](ちょう)が [止](と)まる。", "mean": "유채꽃에 나비가 앉다." }
    }
};

let count = 0;
data.forEach(d => {
    if (updates[d.kanji]) {
        d.on_sentence = updates[d.kanji].on_sentence;
        d.kun_sentence = updates[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Updated final ${count} N2 kanjis.`);
