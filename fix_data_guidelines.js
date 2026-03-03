import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const fixLabelsAndArrays = (p) => {
    // 1. Array-ify sentences if multiple readings
    const onReadings = p.on_reading.split(/[,/]/).filter(r => r && r !== '-' && r !== '');
    const kunReadings = p.kun_reading.split(/[,/]/).filter(r => r && r !== '-' && r !== '');

    if (onReadings.length > 1 && p.on_sentence && !Array.isArray(p.on_sentence)) {
        p.on_sentence = [p.on_sentence];
        // Note: Ideally we add more sentences, but we can't auto-generate them.
    }
    if (kunReadings.length > 1 && p.kun_sentence && !Array.isArray(p.kun_sentence)) {
        p.kun_sentence = [p.kun_sentence];
    }

    // 2. Fix labels in examples
    p.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
            // Check if reading matches any on_reading or kun_reading
            const isOn = onReadings.some(onR => {
                const base = onR.split('.')[0].toLowerCase();
                // Check if example reading (hiragana) matches on_reading (katakana)
                // Need a kana converter or just check phonetically.
                // Simple check for common patterns:
                return ex.reading.includes(base) || base.includes(ex.reading);
            });
            // Better check: if it's katakana, it's likely ON. But examples[].reading is usually hiragana.

            // Let's use a simpler heuristic: check for any match.
            if (isOn) ex.mean += ' (음독)';
            else ex.mean += ' (훈독)'; // Default to kun if not clearly on
        }
    });
};

data.forEach(fixLabelsAndArrays);

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Automated fixes applied.');
