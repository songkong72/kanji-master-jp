const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// Mapping for common mis-typed Korean particles in Japanese fields
const korToJap = {
    '은': 'は', '는': 'は', '이': 'が', '가': '가', // wait, 가 is both.
    '을': 'を', '를': '를', // wait, 를 is korean.
    '에': 'に', '의': 'の', '와': 'と', '과': 'と', '도': 'も'
};

const mapping = {
    'け이': 'けい',
    '경': 'けい',
    '이': 'い',
    '는': 'は',
    '를': 'を',
    '에': 'に',
    '의': 'の',
    '가': 'が'
};

let count = 0;
data.forEach(d => {
    let changed = false;

    // Check sentences
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (s && s.text) {
            const original = s.text;
            // Selective replace
            s.text = s.text.replace(/[가-힣]/g, (match) => {
                const map = { '는': 'は', '이': '이', '에': '에', '기': 'き', '테': 'て', '이': 'い' };
                // Actually, let's just use a more surgical approach for the known '勍' issue
                return mapping[match] || match;
            });
            if (s.text !== original) changed = true;
        }
    });

    // Check examples
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading && /[가-힣]/.test(ex.reading)) {
                const original = ex.reading;
                ex.reading = ex.reading.replace(/[가-힣]/g, (m) => mapping[m] || m);
                if (ex.reading !== original) {
                    console.log(`Fixed example reading for ${d.kanji}: ${original} -> ${ex.reading}`);
                    changed = true;
                }
            }
        });
    }

    if (changed) count++;
});

// Specifically fix 勍
const kyoh = data.find(k => k.kanji === '勍');
if (kyoh) {
    kyoh.examples[0].reading = "けいてき";
    kyoh.on_sentence.text = "[勍](けい)[敵](てき)に[立](た)ち[向](む)かう。";
}

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Total items fixed: ${count}`);
