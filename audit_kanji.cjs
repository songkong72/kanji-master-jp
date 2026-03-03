const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const audit = {
    koreanInText: [],
    multiReadingArrayMismatch: [],
    missingExampleType: [],
    badLabels: [],
    badRuby: []
};

const hasKorean = (s) => /[가-힣]/.test(s);

data.forEach(d => {
    let idLabel = `${d.id}: ${d.kanji}`;

    // 1. Korean in forbidden fields
    const checkText = (text, field) => {
        if (text && hasKorean(text)) {
            audit.koreanInText.push({ id: idLabel, field, text });
        }
    };

    [d.on_sentence, d.kun_sentence].forEach((s, i) => {
        const field = i === 0 ? 'on_sentence' : 'kun_sentence';
        if (!s) return;
        if (Array.isArray(s)) {
            s.forEach((item, idx) => checkText(item.text, `${field}[${idx}]`));
        } else {
            checkText(s.text, field);
        }
    });

    if (d.examples) {
        d.examples.forEach((ex, idx) => {
            if (hasKorean(ex.word)) audit.koreanInText.push({ id: idLabel, field: `examples[${idx}].word`, text: ex.word });
            if (hasKorean(ex.reading)) audit.koreanInText.push({ id: idLabel, field: `examples[${idx}].reading`, text: ex.reading });
        });
    }

    if (hasKorean(d.on_reading)) audit.koreanInText.push({ id: idLabel, field: 'on_reading', text: d.on_reading });
    if (hasKorean(d.kun_reading)) audit.koreanInText.push({ id: idLabel, field: 'kun_reading', text: d.kun_reading });

    // 2. Multi-reading Array Mismatch
    const onCount = d.on_reading === '-' ? 0 : d.on_reading.split('/').length;
    const kunCount = d.kun_reading === '-' ? 0 : d.kun_reading.split('/').length;

    if (onCount > 1) {
        if (!Array.isArray(d.on_sentence) || d.on_sentence.length < onCount) {
            audit.multiReadingArrayMismatch.push({ id: idLabel, field: 'on_reading', count: onCount, sentenceLen: Array.isArray(d.on_sentence) ? d.on_sentence.length : 1 });
        }
    }
    if (kunCount > 1) {
        if (!Array.isArray(d.kun_sentence) || d.kun_sentence.length < kunCount) {
            audit.multiReadingArrayMismatch.push({ id: idLabel, field: 'kun_reading', count: kunCount, sentenceLen: Array.isArray(d.kun_sentence) ? d.kun_sentence.length : 1 });
        }
    }

    // 3. Example Diversity & Labels
    let hasOnEx = false;
    let hasKunEx = false;
    if (d.examples) {
        d.examples.forEach(ex => {
            if (!ex.mean.endsWith('(음독)') && !ex.mean.endsWith('(훈독)')) {
                audit.badLabels.push({ id: idLabel, word: ex.word, mean: ex.mean });
            }
            if (ex.mean.includes('(음독)')) hasOnEx = true;
            if (ex.mean.includes('(훈독)')) hasKunEx = true;
        });

        if (d.on_reading !== '-' && !hasOnEx) audit.missingExampleType.push({ id: idLabel, type: '음독' });
        if (d.kun_reading !== '-' && !hasKunEx) audit.missingExampleType.push({ id: idLabel, type: '훈독' });
    }

    // 4. Ruby format
    const rubyRegex = /\[(.*?)\]\((.*?)\)/g;
    const checkRuby = (text, field) => {
        if (!text) return;
        let match;
        while ((match = rubyRegex.exec(text)) !== null) {
            const [full, kanji, reading] = match;
            if (kanji.length > 1 && !reading.includes('.')) {
                // Might be unsplit compound
                audit.badRuby.push({ id: idLabel, field, full });
            }
        }
    };
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s) return;
        if (Array.isArray(s)) s.forEach(item => checkRuby(item.text, 'sentence'));
        else checkRuby(s.text, 'sentence');
    });
});

fs.writeFileSync('audit_report.json', JSON.stringify(audit, null, 2));
console.log('Audit complete. See audit_report.json');
console.log('Summary:');
console.log('- Korean in text fields:', audit.koreanInText.length);
console.log('- Multi-reading mismatch:', audit.multiReadingArrayMismatch.length);
console.log('- Missing examples (ON/KUN):', audit.missingExampleType.length);
console.log('- Bad labels:', audit.badLabels.length);
console.log('- Potential bad ruby:', audit.badRuby.length);
