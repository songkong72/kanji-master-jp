const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 11); // 十
if (target) {
    target.kun_sentence = [
        {
            "text": "[十](とお)の[指](ゆび)を[折](お)る。",
            "mean": "열 손가락을 꼽다."
        },
        {
            "text": "[十](とお)[日](か)[間](かん)の[旅](りょ)[行](こう)。",
            "mean": "열흘 동안의 여행."
        }
    ];
    // Check: the second reading is とお.か. If the sentence is [十](とお)[日](か), the highlight on [十] will only show 'とお'.
    // To solve this, if the reading in kun_reading includes okurigana like 'とお.か', 
    // the target card should realistically show that specific reading.

    // Actually, in Japanese, '十' itself has the kun-reading 'とお'. 'とおか' is the reading for '十日'.
    // If we want the card to precisely match the target reading 'とおか', and it's for '十', 
    // but represented by '十日', we should make sure the highlight works.
}

// Global script to ensure the SENTENCE RUBY matches the KUN_READING okurigana
data.forEach(d => {
    const kuns = (d.kun_reading || "").split(/[、/]+/).map(r => r.trim()).filter(r => r && r !== '-');
    if (kuns.length > 1 && Array.isArray(d.kun_sentence)) {
        kuns.forEach((k, idx) => {
            if (d.kun_sentence[idx]) {
                const parts = k.split('.'); // [base, okuri]
                const base = parts[0];
                const okuri = parts[1] || "";

                // If the sentence ruby for the target kanji doesn't match 'base', we need to fix it.
                // Or if it's missing the okuri part in the text.
                const s = d.kun_sentence[idx];
                const match = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/); // First ruby usually target
                if (match && match[1] === d.kanji) {
                    if (match[2] !== base) {
                        s.text = s.text.replace(`[${match[1]}](${match[2]})`, `[${match[1]}](${base})`);
                    }
                }
            }
        });
    }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Parity Corrected for Dot Readings.');
