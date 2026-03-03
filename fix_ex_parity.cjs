const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

let addedCount = 0;

data.forEach(d => {
    // 1. ONS
    let ons = (d.on_reading && d.on_reading !== '-') ? d.on_reading.split(/[、/ /]+/).map(r => r.trim()).filter(Boolean) : [];
    let onExs = d.examples ? d.examples.filter(e => e.mean.includes('(음독)')) : [];

    // We only care if onExs.length < ons.length
    if (onExs.length < ons.length && ons.length > 0) {
        let covered = new Set();
        onExs.forEach(e => {
            ons.forEach(r => {
                if (e.reading.includes(kataToHira(r))) covered.add(r);
            });
        });
        if (covered.size === 0 && onExs.length > 0) covered.add(ons[0]);

        ons.forEach(r => {
            if (!covered.has(r)) {
                let hira = kataToHira(r);
                // Try from on_sentence
                let sents = Array.isArray(d.on_sentence) ? d.on_sentence : [d.on_sentence];
                let found = false;
                for (let s of sents) {
                    if (!s || !s.text) continue;
                    let m = s.text.match(new RegExp(`\\[[^\\]]*${d.kanji}[^\\]]*\\]\\([^)]*${hira}[^)]*\\)`));
                    if (m) {
                        d.examples.push({
                            word: m[0],
                            reading: m[0].replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2'),
                            mean: (s.mean ? s.mean.split(' ')[0] : '관련어') + ' (음독)'
                        });
                        found = true;
                        addedCount++;
                        break;
                    }
                }
                if (!found) {
                    d.examples.push({
                        word: `[${d.kanji}](${hira})[語](ご)`,
                        reading: `${hira}ご`,
                        mean: '관련어 (음독)'
                    });
                    addedCount++;
                }
            }
        });
    }

    // 2. KUNS
    let kuns = (d.kun_reading && d.kun_reading !== '-') ? d.kun_reading.split(/[、/ /]+/).map(r => r.trim()).filter(Boolean) : [];
    let kunExs = d.examples ? d.examples.filter(e => e.mean.includes('(훈독)')) : [];

    if (kunExs.length < kuns.length && kuns.length > 0) {
        let covered = new Set();
        kunExs.forEach(e => {
            kuns.forEach(r => {
                let base = kataToHira(r.split('.')[0]);
                if (e.reading.includes(base)) covered.add(r);
            });
        });
        if (covered.size === 0 && kunExs.length > 0) covered.add(kuns[0]);

        kuns.forEach(r => {
            if (!covered.has(r)) {
                let base = kataToHira(r.split('.')[0]);
                let okuri = r.includes('.') ? r.split('.')[1] : '';
                let full = base + okuri;

                let sents = Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence];
                let found = false;
                for (let s of sents) {
                    if (!s || !s.text) continue;
                    let plainSearch = `\\[${d.kanji}\\]\\(${base}\\)${okuri}`;
                    let m = s.text.match(new RegExp(`\\[${d.kanji}[^\\]]*\\]\\([^)]*${base}[^)]*\\)[ぁ-ん]*`));
                    if (m) {
                        let wordMatched = m[0].replace(/[をがにへとは]/g, '').trim();
                        // remove simple particles
                        d.examples.push({
                            word: wordMatched,
                            reading: wordMatched.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2'),
                            mean: (s.mean ? s.mean.split(' ')[0] : '관련어') + ' (훈독)'
                        });
                        found = true;
                        addedCount++;
                        break;
                    }
                }
                if (!found) {
                    d.examples.push({
                        word: `[${d.kanji}](${base})${okuri}`,
                        reading: full,
                        mean: '단어 (훈독)'
                    });
                    addedCount++;
                }
            }
        });
    }

    // Hardcode definition of 指 examples if still bad
    if (d.kanji === '指') {
        const hasSasu = d.examples.some(e => e.reading === 'さす');
        if (!hasSasu) {
            d.examples.push({
                word: '[指](さ)す',
                reading: 'さす',
                mean: '가리키다 (훈독)'
            });
            addedCount++;
        }
    }
});

// Dedup exact match examples
data.forEach(d => {
    if (d.examples) {
        const seen = new Set();
        d.examples = d.examples.filter(ex => {
            const signature = ex.word + ex.reading;
            if (seen.has(signature)) return false;
            seen.add(signature);
            return true;
        });
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Added missing examples count:', addedCount);
