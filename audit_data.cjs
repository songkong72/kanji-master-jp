const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const auditResults = {
    missingExamples: [],
    singleKanjiInExamples: [],
    parityIssuesOn: [],
    parityIssuesKun: [],
    koreanInJapanese: [],
    brokenRuby: [],
    emptySentences: []
};

data.forEach(d => {
    const k = d.kanji;
    const ons = (d.on_reading || "").split(/[、/ /]+/).map(r => r.trim()).filter(r => r && r !== '-');
    const kuns = (d.kun_reading || "").split(/[、/ /]+/).map(r => r.trim()).filter(r => r && r !== '-');

    // 1. Missing Examples
    if (!d.examples || d.examples.length === 0) auditResults.missingExamples.push(k);

    // 2. Single Kanji in Examples
    d.examples.forEach(ex => {
        let plain = ex.word.replace(/\[([^\]]+)\]\(([^)*])\)/g, '$1');
        if (plain === k) auditResults.singleKanjiInExamples.push(`${k}: ${ex.word}`);
    });

    // 3. Parity Issues
    const onSents = Array.isArray(d.on_sentence) ? d.on_sentence : (d.on_sentence ? [d.on_sentence] : []);
    const kunSents = Array.isArray(d.kun_sentence) ? d.kun_sentence : (d.kun_sentence ? [d.kun_sentence] : []);

    if (ons.length > 0 && onSents.length < ons.length) auditResults.parityIssuesOn.push(`${k} (Readings: ${ons.length}, Sents: ${onSents.length})`);
    if (kuns.length > 0 && kunSents.length < kuns.length) auditResults.parityIssuesKun.push(`${k} (Readings: ${kuns.length}, Sents: ${kunSents.length})`);

    // 4. Korean in Japanese fields
    const checkKorean = (text) => /[가-힣]/.test(text);
    const fieldsToCheck = [
        ...onSents.map(s => s.text),
        ...kunSents.map(s => s.text),
        ...d.examples.map(ex => ex.word),
        ...d.examples.map(ex => ex.reading)
    ];
    if (fieldsToCheck.some(checkKorean)) auditResults.koreanInJapanese.push(k);

    // 5. Broken Ruby
    const checkBroken = (text) => /\[\]|\(\)|\[[^\]]*$|\([^)]*$/.test(text);
    if (fieldsToCheck.some(checkBroken)) auditResults.brokenRuby.push(k);

    // 6. Empty sentences (where text is '-' or empty but readings exist)
    if (ons.length > 0 && onSents.some(s => !s.text || s.text === '-')) auditResults.emptySentences.push(`${k} (On)`);
    if (kuns.length > 0 && kunSents.some(s => !s.text || s.text === '-')) auditResults.emptySentences.push(`${k} (Kun)`);
});

console.log('--- AUDIT RESULTS ---');
Object.entries(auditResults).forEach(([key, val]) => {
    console.log(`${key}: ${val.length}`);
    if (val.length > 0 && val.length < 20) console.log('  Items:', val.join(', '));
    else if (val.length >= 20) console.log('  Items: (too many to list)');
});
