const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

const badSentences = ["배운다", "중요하다", "조사합니다", "사용한다"];

const auditReport = data.map(d => {
    const issues = [];

    // 1. Check for placeholders
    const checkPlaceholder = (s) => {
        if (s && s.mean && badSentences.some(b => s.mean.includes(b))) return true;
        if (s && s.text === '-') return true;
        return false;
    }
    if (Array.isArray(d.on_sentence)) { if (d.on_sentence.some(checkPlaceholder)) issues.push('on-placeholder'); }
    else { if (checkPlaceholder(d.on_sentence)) issues.push('on-placeholder'); }
    if (Array.isArray(d.kun_sentence)) { if (d.kun_sentence.some(checkPlaceholder)) issues.push('kun-placeholder'); }
    else { if (checkPlaceholder(d.kun_sentence)) issues.push('kun-placeholder'); }

    // 2. Check for kun-alignment
    const kunCount = (d.kun_reading && d.kun_reading !== '-') ? d.kun_reading.split(/[、/,\s]+/).length : 0;
    const sentenceCount = Array.isArray(d.kun_sentence) ? d.kun_sentence.length : (d.kun_sentence && d.kun_sentence.text !== '-' ? 1 : 0);
    if (kunCount > 1 && sentenceCount < kunCount) {
        issues.push('kun-alignment-mismatch');
    }

    // 3. Ruby split check
    const checkUnsplit = (s) => {
        if (s && s.text && /\[([一-龥]{2,})\]\(([^)]+)\)/.test(s.text)) return true;
        return false;
    }
    if (Array.isArray(d.on_sentence) ? d.on_sentence.some(checkUnsplit) : checkUnsplit(d.on_sentence)) issues.push('unsplit-ruby-sentence');
    if (Array.isArray(d.kun_sentence) ? d.kun_sentence.some(checkUnsplit) : checkUnsplit(d.kun_sentence)) issues.push('unsplit-ruby-sentence');
    if (d.examples.some(ex => hasUnsplitRuby(ex.word))) issues.push('unsplit-ruby-example');

    if (issues.length > 0) return { id: d.id, kanji: d.kanji, issues };
    return null;
}).filter(x => x);

function hasUnsplitRuby(str) {
    return /\[([一-龥]{2,})\]\(([^)]+)\)/.test(str);
}

console.log(`Audited 1058: Found ${auditReport.length} kanji with issues.`);
fs.writeFileSync('audit_issues.json', JSON.stringify(auditReport, null, 2));
