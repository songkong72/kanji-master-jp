const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

const report = {
    duplicateExamples: [],
    placeholdersFound: [],
    missingReadingSentences: [],
    unsplitRuby: [],
    koreanInJapFields: [],
    missingLabels: [],
    dataCorruption: [],
    totalIssues: 0
};

data.forEach(d => {
    const idLabel = `${d.id}: ${d.kanji}`;
    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => r.trim());
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim());

    // 1. Duplicate Examples Check
    if (d.examples) {
        const seen = new Set();
        d.examples.forEach(ex => {
            if (seen.has(ex.reading)) {
                report.duplicateExamples.push(`${idLabel} -> 중복 발음: ${ex.reading}`);
            }
            seen.add(ex.reading);

            // 2. Placeholders Check
            if (ex.word.includes('...') || ex.mean.includes('보강') || ex.mean.includes('...')) {
                report.placeholdersFound.push(`${idLabel} -> 단어장: ${ex.word}`);
            }
            // 6. Missing Labels
            if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
                report.missingLabels.push(`${idLabel} -> ${ex.word}`);
            }
        });
    }

    // 3. Missing Reading Sentences
    const onS = Array.isArray(d.on_sentence) ? d.on_sentence : (d.on_sentence ? [d.on_sentence] : []);
    const kunS = Array.isArray(d.kun_sentence) ? d.kun_sentence : (d.kun_sentence ? [d.kun_sentence] : []);
    if (ons.length > onS.length) report.missingReadingSentences.push(`${idLabel} -> 음독 예문 부족 (${ons.length}개 필요, ${onS.length}개 있음)`);
    if (kuns.length > kunS.length) report.missingReadingSentences.push(`${idLabel} -> 훈독 예문 부족 (${kuns.length}개 필요, ${kunS.length}개 있음)`);

    // 4. Unsplit Ruby & 5. Korean in Jap & 2. Placeholder in Sentence
    const checkText = (s, field) => {
        if (!s) return;
        (Array.isArray(s) ? s : [s]).forEach(i => {
            // Unsplit Ruby
            const rubyMatches = i.text.match(/\[(.*?)\]\((.*?)\)/g);
            if (rubyMatches) {
                rubyMatches.forEach(m => {
                    const k = m.match(/\[(.*?)\]/)[1];
                    if (k.length > 1) report.unsplitRuby.push(`${idLabel} -> ${field}: ${m}`);
                });
            }
            // Korean in Jap
            if (/[가-힣]/.test(i.text)) report.koreanInJapFields.push(`${idLabel} -> ${field}: ${i.text}`);
            // Placeholder in Sentence
            if (i.text.includes('예문입니다') || i.text.includes('...')) report.placeholdersFound.push(`${idLabel} -> ${field}: ${i.text}`);
        });
    };
    checkText(d.on_sentence, 'on_sentence');
    checkText(d.kun_sentence, 'kun_sentence');

    // 7. Korean in Readings
    if (/[가-힣]/.test(d.on_reading) || /[가-힣]/.test(d.kun_reading)) {
        report.koreanInJapFields.push(`${idLabel} -> 읽기 정보: ${d.on_reading} / ${d.kun_reading}`);
    }

    // 8. Data Corruption (Reading is '-' but has sentence)
    if (d.on_reading === '-' && d.on_sentence !== null) report.dataCorruption.push(`${idLabel} -> 음독 없음에도 문장 존재`);
    if (d.kun_reading === '-' && d.kun_sentence !== null) report.dataCorruption.push(`${idLabel} -> 훈독 없음에도 문장 존재`);
});

report.totalIssues = Object.keys(report).reduce((acc, key) => acc + (Array.isArray(report[key]) ? report[key].length : 0), 0);

console.log(JSON.stringify(report, null, 2));
