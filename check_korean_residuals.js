import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
const issues = [];

data.forEach(p => {
    // Check examples
    p.examples.forEach((ex, i) => {
        if (koreanRegex.test(ex.word)) {
            issues.push(`ID ${p.id} (${p.kanji}) example ${i} word has Korean: ${ex.word}`);
        }
        if (ex.reading && koreanRegex.test(ex.reading)) {
            issues.push(`ID ${p.id} (${p.kanji}) example ${i} reading has Korean: ${ex.reading}`);
        }
        // Check labels
        if (ex.mean && !ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
            // This is a policy violation but not strictly "Korean in Japanese field"
            // issues.push(`ID ${p.id} (${p.kanji}) example ${i} mean missing label: ${ex.mean}`);
        }
    });

    // Check sentence text
    if (p.on_sentence) {
        const sentences = Array.isArray(p.on_sentence) ? p.on_sentence : [p.on_sentence];
        sentences.forEach((s, i) => {
            // Note: sentence text often has Korean particles if not cleaned.
            // But usually, it should be clean.
            // Let's check for Japanese text containing Korean.
            if (koreanRegex.test(s.text)) {
                issues.push(`ID ${p.id} (${p.kanji}) on_sentence ${i} has Korean: ${s.text}`);
            }
        });
    }
    if (p.kun_sentence) {
        const sentences = Array.isArray(p.kun_sentence) ? p.kun_sentence : [p.kun_sentence];
        sentences.forEach((s, i) => {
            if (koreanRegex.test(s.text)) {
                issues.push(`ID ${p.id} (${p.kanji}) kun_sentence ${i} has Korean: ${s.text}`);
            }
        });
    }
});

if (issues.length > 0) {
    console.log(`Found ${issues.length} issues:`);
    issues.slice(0, 20).forEach(issue => console.log(issue));
    if (issues.length > 20) console.log('...');
} else {
    console.log('No issues found with Korean characters in Japanese fields!');
}
