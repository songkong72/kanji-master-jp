const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

// Helper mapping for kanji
function kataToHira(kata) {
    return kata.replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

function getReadings(d) {
    const on = new Set();
    const kun = new Set();
    if (d.on_reading) {
        d.on_reading.split(/[、/,\s]+/).forEach(r => {
            if (r && r !== '-') on.add(kataToHira(r.trim()));
        });
    }
    if (d.kun_reading) {
        d.kun_reading.split(/[、/,\s]+/).forEach(r => {
            if (r && r !== '-') kun.add(r.split('.')[0].trim());
        });
    }
    return { on, kun };
}

let fixedLabels = 0;

data.forEach(d => {
    const { on, kun } = getReadings(d);

    d.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)') && !ex.mean.includes('(특수)')) {
            let isOn = false;
            let isKun = false;

            const charArray = ex.word.split('');
            if (charArray.includes(d.kanji)) {
                if (ex.word.length > 1 && !/[ぁ-ん]/.test(ex.word)) {
                    isOn = true;
                } else if (/[ぁ-ん]/.test(ex.word)) {
                    isKun = true;
                } else {
                    for (let r of on) { if (ex.reading && ex.reading.includes(r)) isOn = true; }
                    for (let r of kun) { if (ex.reading && ex.reading.includes(r)) isKun = true; }
                }
            }

            // Smart Fallback based on typical Japanese vocabulary structure
            if (isOn) ex.mean += ' (음독)';
            else if (isKun) ex.mean += ' (훈독)';
            else {
                // If it's pure kanji strings length>1, mostly On-yomi
                if (!/[ぁ-ん]/.test(ex.word) && ex.word.length > 1) {
                    ex.mean += ' (음독)';
                } else {
                    ex.mean += ' (훈독)';
                }
            }
            fixedLabels++;
        }
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log(`Added missing ON/KUN tags to ${fixedLabels} words.`);
