const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const updates = {
    "畿": {
        "on_sentence": { "text": "[関西](かんさい)の[中心](ちゅうしん)は[近畿](きんき)[地方](ちほう)だ。", "mean": "간사이의 중심은 긴키 지방이다." },
        "kun_sentence": { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." }
    },
    "駄": {
        "on_sentence": { "text": "[最近](さいきん)は[無駄](むだ)な[買](か)い[物](もの)を[多](おお)くした。", "mean": "최근에는 헛된 쇼핑을 많이 했다." },
        "kun_sentence": { "text": "[駄賃](だちん)をもらって[使](つか)いに[行](い)く。", "mean": "사례비(푼돈)를 받고 심부름을 가다." }
    },
    "旦": {
        "on_sentence": { "text": "[元旦](がんたん)に[初詣](はつもうで)に[出](で)かける。", "mean": "원단에 하츠모데(새해 첫 참배)를 가다." },
        "kun_sentence": { "text": "[旦那](だんな)의 [帰](かえ)りを[心](こころ)[待](ま)ちにする。", "mean": "남편의 귀가를 고대한다." }
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
console.log(`Absolutely finished remediation for N1/N2.`);
