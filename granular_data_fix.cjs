const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const granularFixes = {
    "勍": {
        "on_sentence": { "text": "[勍](けい)[敵](てき)に[立](た)ち[向](む)かう。", "mean": "강적에 맞서다." }
    },
    "婚姻": { // Searching by kanji below
    }
};

data.forEach(d => {
    if (d.kanji === '勍') {
        d.on_sentence = { "text": "[勍](け이)[敵](てき)に[立](た)ち[向](む)かう。", "mean": "강적에 맞서다." };
        // Wait, I typed '이' again. Correcting:
        d.on_sentence = { "text": "[勍](けい)[敵](てき)에[立](た)ち[向](む)かう。".replace('에', 'に'), "mean": "강적에 맞서다." };
    }
    if (d.kanji === '姻') {
        // [法律](ほうりつ)に[婚姻](こんいん)が[成立](せいりつ)した
        d.on_sentence = { "text": "[法律](ほうりつ)に[婚](こん)[姻](いん)が[成立](せいりつ)した。", "mean": "법률에 근거하여 혼인이 성립했다." };
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log("Granular data fix applied.");
