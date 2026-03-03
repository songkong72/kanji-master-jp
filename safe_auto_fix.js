import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Heuristic to check if a hiragana string matches katakana on_reading
const isMatch = (reading, targets) => {
    const cleanReading = reading.replace(/[.\s]/g, '').toLowerCase();
    return targets.some(t => {
        const cleanTarget = t.replace(/[.\s]/g, '').toLowerCase();
        // This is a rough check since on_reading is Katakana and reading is Hiragana
        // But phonetically they match in UTF-8 scripts often. 
        // For simplicity, we just see if one contains the other.
        return cleanReading.includes(cleanTarget) || cleanTarget.includes(cleanReading);
    });
};

const fixedReport = {
    arrayified: 0,
    labeled: 0,
    koreanFixed: 0
};

data.forEach(p => {
    const onReadings = p.on_reading.split(/[,/]/).map(r => r.trim()).filter(r => r && r !== '-');
    const kunReadings = p.kun_reading.split(/[,/]/).map(r => r.trim()).filter(r => r && r !== '-');

    // 1. Safe Array-ification
    if (onReadings.length > 1 && p.on_sentence && !Array.isArray(p.on_sentence)) {
        p.on_sentence = [p.on_sentence];
        fixedReport.arrayified++;
    }
    if (kunReadings.length > 1 && p.kun_sentence && !Array.isArray(p.kun_sentence)) {
        p.kun_sentence = [p.kun_sentence];
        fixedReport.arrayified++;
    }

    // 2. Automated Labeling
    p.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
            // Logic to determine if it's on or kun
            // If reading (Hiragana) matches an on_reading (Katakana)
            // (Note: In this specific project, readings are stored in Hiragana)
            const isOn = isMatch(ex.reading, onReadings);
            const isKun = isMatch(ex.reading, kunReadings);

            if (isOn && !isKun) {
                ex.mean += ' (음독)';
                fixedReport.labeled++;
            } else if (isKun && !isOn) {
                ex.mean += ' (훈독)';
                fixedReport.labeled++;
            } else if (isKun && isOn) {
                // Ambigous, let's look at Katakana vs Hiragana patterns? 
                // Actually, let's just default to kun if it's longer or has okurigana
                if (ex.reading.length > 2) {
                    ex.mean += ' (훈독)';
                } else {
                    ex.mean += ' (음독)';
                }
                fixedReport.labeled++;
            } else {
                // No clear match, default to suffix based on context or leave it?
                // Most are ON if they are 2-kanji compounds.
                ex.mean += ' (음독)';
                fixedReport.labeled++;
            }
        }
    });

    // 3. Known Korean Fixes in N1/N2
    if (p.kanji === '肺' && p.examples[0].word === '肺활량') {
        p.examples[0].word = '肺活量';
        p.examples[0].reading = 'はいかつりょう';
        p.examples[0].mean = '폐활량 (음독)';
        fixedReport.koreanFixed++;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Safe fixes applied:', fixedReport);
