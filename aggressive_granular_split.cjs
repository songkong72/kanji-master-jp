const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let splitCount = 0;
data.forEach(d => {
    let changed = false;
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            // ONLY split if the block contains our target kanji
            if (kanjis.length > 1 && kanjis.includes(d.kanji)) {
                // Heuristic 1: Kanji length == Reading length
                if (kanjis.length === read.length) {
                    let parts = '';
                    for (let i = 0; i < kanjis.length; i++) parts += `[${kanjis[i]}](${read[i]})`;
                    return parts;
                }

                // Heuristic 2: 2 kanjis, reading length 4 (2-2)
                if (kanjis.length === 2 && read.length === 4) {
                    return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
                }

                // Heuristic 3: 2 kanjis, reading length 3 (1-2 or 2-1)
                // This is risky, but for common things like 探求(たんきゅう) it's 2+3.
                // For 探(たん)+求(きゅう), it's 2-3.
                // Let's use a manual map for the most common ones.
                const manual = {
                    "四捨五入": "[四](し)[捨](しゃ)[五](ご)[入](にゅう)",
                    "探求": "[探](たん)[求](きゅう)",
                    "想像": "[想](そう)[像](ぞう)",
                    "第一": "[第](だい)[一](いち)",
                    "勉強": "[勉](べん)[強](きょう)",
                    "結婚": "[結](けっ)[婚](こん)",
                    "以前": "[以](い)[前](ぜん)",
                    "最後": "[最](さい)[後](ご)",
                    "時間": "[時](じ)[간](かん)", // typo
                    "時間": "[時](じ)[間](かん)",
                    "日本": "[日](に)[本](ほん)",
                    "毎日": "[毎](まい)[日](にち)",
                    "非常": "[非](ひ)[常](じょう)",
                    "現在": "[現](げん)[在](ざい)"
                };
                if (manual[kanjis]) return manual[kanjis];
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });
    if (changed) splitCount++;
});

// Specifically fix 捨
const sha = data.find(k => k.kanji === '捨');
if (sha) {
    sha.on_sentence.text = "[小](しょう)[数](す우) [第](だい)[一](いち)[位](い)を [四](し)[捨](しゃ)[五](ご)[入](にゅう)する。".replace('우', 'う');
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Global granular split complete. Applied to ${splitCount} items.`);
