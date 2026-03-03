const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// 1. Precise fix for 捨 (sha)
const sha = data.find(k => k.kanji === '捨');
if (sha) {
    sha.on_sentence.text = "[小](しょう)[数](すう) [第](だい)[一](いち)[位](い)を [四](し)[捨](しゃ)[五](ご)[入](にゅう)する。";
    console.log("Fixed 捨 specifically.");
}

// 2. Global granular check
let granularCount = 0;
data.forEach(d => {
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;

        // Find blocks like [ABC](abc) where kanji includes d.kanji
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, reading) => {
            if (kanjis.length > 1 && kanjis.includes(d.kanji)) {

                // If it's 2 kanjis and 2 readings (1-to-1)
                if (kanjis.length === 2 && reading.length === 2) {
                    return `[${kanjis[0]}](${reading[0]})[${kanjis[1]}](${reading[1]})`;
                }

                // If it's 2 kanjis and 4 readings (1-to-2)
                if (kanjis.length === 2 && reading.length === 4) {
                    return `[${kanjis[0]}](${reading.substring(0, 2)})[${kanjis[1]}](${reading.substring(2)})`;
                }

                // Common Japanese compounds handle
                const map = {
                    "四捨五入": "[四](し)[捨](しゃ)[五](ご)[入](にゅう)",
                    "探求": "[探](たん)[求](きゅう)",
                    "想像": "[想](そう)[像](ぞう)",
                    "勉強": "[勉](べん)[強](きょう)",
                    "今日": "[今](き)[日](ょう)",
                    "日本": "[日](に)[本](ほん)",
                    "一番": "[一](いち)[番](ばん)",
                    "第一位": "[第](だい)[一](いち)[位](い)"
                };

                if (map[kanjis]) return map[kanjis];
            }
            return full;
        });

        if (s.text !== old) granularCount++;
    });
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Deep granular sweep complete. Fixed ${granularCount} entries.`);
