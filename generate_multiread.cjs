const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

let addedOn = 0;
let addedKun = 0;

data.forEach(d => {
    // 1. Process ON readings
    let ons = (d.on_reading && d.on_reading !== '-') ? d.on_reading.split(/[、/ /]+/).map(r => r.trim()).filter(Boolean) : [];
    if (ons.length > 1) {
        let onS = Array.isArray(d.on_sentence) ? d.on_sentence : [d.on_sentence];
        onS = onS.filter(s => s && s.text && s.text !== '-');

        // Check which readings are covered
        let covered = new Set();
        onS.forEach(s => {
            ons.forEach(r => {
                const rhira = kataToHira(r);
                if (s.text.includes(`(${r})`) || s.text.includes(`(${rhira})`)) {
                    covered.add(r);
                }
            });
            // If we couldn't match strict parenthesis, just assume the first uncovered is covered for the first sentence
        });

        // For first sentence, if it covers 0, assume it covers ons[0]
        if (covered.size === 0 && onS.length > 0) covered.add(ons[0]);

        ons.forEach(r => {
            if (!covered.has(r)) {
                // Find an example with this reading
                let rkata = r;
                let rhira = kataToHira(r);
                let ex = d.examples.find(e => e.reading && (e.reading.includes(rhira) || e.reading.includes(rkata)) && e.mean.includes('(음독)'));

                if (ex) {
                    onS.push({
                        text: `「${ex.word}」の[意味](いみ)を[覚](おぼ)える。`,
                        mean: `'${ex.mean.split(' ')[0]}'의 의미를 외우다.`
                    });
                } else {
                    onS.push({
                        text: `[${d.kanji}](${rhira})の[練習](れんしゅう)です。`,
                        mean: "글자 연습입니다."
                    });
                }
                addedOn++;
            }
        });
        d.on_sentence = onS;
    }

    // 2. Process KUN readings
    let kuns = (d.kun_reading && d.kun_reading !== '-') ? d.kun_reading.split(/[、/ /]+/).map(r => r.trim()).filter(Boolean) : [];
    if (kuns.length > 1) {
        let kunS = Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence];
        kunS = kunS.filter(s => s && s.text && s.text !== '-');

        let covered = new Set();
        kunS.forEach(s => {
            kuns.forEach(r => {
                const base = r.split('.')[0];
                const baseHira = kataToHira(base);
                if (s.text.includes(`(${base})`) || s.text.includes(`(${baseHira})`)) {
                    covered.add(r);
                }
            });
        });

        if (covered.size === 0 && kunS.length > 0) covered.add(kuns[0]);

        kuns.forEach(r => {
            if (!covered.has(r)) {
                const base = r.split('.')[0];
                const okuri = r.includes('.') ? r.split('.')[1] : '';
                const baseHira = kataToHira(base);
                const fullHira = baseHira + okuri;

                let ex = d.examples.find(e => e.reading && e.reading.includes(fullHira) && e.mean.includes('(훈독)'));

                if (ex) {
                    if (ex.word.includes('[')) { // It's ruby wrapped
                        kunS.push({
                            text: `「${ex.word}」と[言](い)う。`,
                            mean: `'${ex.mean.split(' ')[0]}'(이)라고 말하다.`
                        });
                    } else {
                        kunS.push({
                            text: `「[${ex.word}](${ex.reading})」と[言](い)う。`,
                            mean: `'${ex.mean.split(' ')[0]}'(이)라고 말하다.`
                        });
                    }
                } else {
                    // Fallback using the standalone kun reading
                    kunS.push({
                        text: `[${d.kanji}](${baseHira})${okuri}のかたちを[覚](おぼ)える。`,
                        mean: "모양을 외우다."
                    });
                }
                addedKun++;
            }
        });
        d.kun_sentence = kunS;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Added missing ON sentences: ${addedOn}`);
console.log(`Added missing KUN sentences: ${addedKun}`);
