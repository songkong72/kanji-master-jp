const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const commonSplits = {
    "四捨五入": [
        { k: "四", r: "し" }, { k: "捨", r: "しゃ" }, { k: "五", r: "ご" }, { k: "入", r: "にゅう" }
    ],
    "今日": [
        { k: "今", r: "き" }, { k: "日", r: "ょう" } // Irregular but this works for highlighting
    ],
    "明日": [
        { k: "明", r: "あ" }, { k: "日", r: "した" } // Irregular
    ],
    "昨日": [
        { k: "昨", r: "き" }, { k: "日", r: "のう" }
    ],
    "日本人": [
        { k: "日", r: "に" }, { k: "본", r: "ほん" }, { k: "人", r: "じん" } // Fix typo: 본 -> 本
    ],
    "日本人": [
        { k: "日", r: "に" }, { k: "本", r: "ほん" }, { k: "人", r: "じん" }
    ],
    "日本語": [
        { k: "日", r: "に" }, { k: "本", r: "ほん" }, { k: "語", r: "ご" }
    ],
    "第一位": [
        { k: "第", r: "だい" }, { k: "一", r: "いち" }, { k: "位", r: "い" }
    ]
};

// Auto-split logic attempt
function trySplit(kanjis, reading) {
    if (commonSplits[kanjis]) {
        return commonSplits[kanjis].map(p => `[${p.k}](${p.r})`).join('');
    }

    // Equal length
    if (kanjis.length === reading.length) {
        let res = '';
        for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${reading[i]})`;
        return res;
    }

    return null;
}

let fixes = 0;
data.forEach(d => {
    let changed = false;
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            if (kanjis.length > 1 && kanjis.includes(d.kanji)) {
                const split = trySplit(kanjis, read);
                if (split) return split;
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });
    if (changed) fixes++;
});

// Specifically fix 捨
const sha = data.find(k => k.kanji === '捨');
if (sha) {
    sha.on_sentence.text = "[小](しょう)[数](すう) [第](だい)[一](いち)[位](이)를 [四](し)[捨](しゃ)[五](ご)[入](にゅう)する。".replace('를', 'を').replace('이', 'い');
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Global split complete. Items fixed: ${fixes}`);
