const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// Manually split for Gou and a few others
const manualSplits = {
    "剛": {
        "on_sentence": "[鋼](は가ね)のような[剛](ごう)[健](けん)な[肉](にく)[体](たい)。", // fixed: はがね
        "kun_sentence": "[質](しつ)[実](じつ)[剛](ごう)[健](けん)な[校](こう)[風](ふう)。"
    }
};

data.forEach(d => {
    if (d.kanji === '剛') {
        d.on_sentence.text = "[鋼](はがね)のような[剛](ご우)[健](けん)な[肉](にく)[体](たい)。".replace('우', 'う');
        d.kun_sentence.text = "[質](しつ)[実](じつ)[剛](ごう)[健](けん)な[校](こう)[風](ふう)。";
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Fixed Gou highlighting.');
