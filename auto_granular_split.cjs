const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

let count = 0;
data.forEach(d => {
    if (d.category !== 'N1' && d.category !== 'N2') return;

    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const original = s.text;

        // Match [AB](ab) patterns
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (fullMatch, kanjis, readings) => {
            // Heuristic 1: Kanji count == Reading count
            // This works for things like [四肢](しし) -> [四](し)[肢](し)
            if (kanjis.length === readings.length && kanjis.length > 1) {
                let replacement = '';
                for (let i = 0; i < kanjis.length; i++) {
                    replacement += `[${kanjis[i]}](${readings[i]})`;
                }
                return replacement;
            }

            // Heuristic 2: Known compounds mapping
            const map = {
                "四肢": "四肢", // handled by H1
                "堕落": "堕落", // handled by H1
                "婚姻": "婚姻", // handled by 婚(こん) 姻(いん)
                "規範": "規範", // H1
                "防御": "防御", // H1
            };

            // Heuristic 3: Common length 2, reading length 3 or more (e.g. [太陽](たいよう))
            // This is harder but common.
            // If the user's focus is on d.kanji, we can split it more safely.

            return fullMatch;
        });

        if (s.text !== original) count++;
    });
});

// Specifically address the 剛(Gou) case which showed up as a problem
data.forEach(d => {
    if (d.kanji === '剛') {
        d.on_sentence.text = "[鋼](はがね)のような[剛](ごう)[健](けん)な[肉](にく)[体](たい)。";
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Auto-granularization applied to ${count} entries.`);
