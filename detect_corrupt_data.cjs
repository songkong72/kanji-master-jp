const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const issues = data.filter(d => {
    if (d.category !== 'N1' && d.category !== 'N2') return false;

    const sentences = [d.on_sentence?.text, d.kun_sentence?.text].filter(t => t);
    const badSentences = sentences.some(s => {
        if (s.includes('()')) return true; // Empty ruby
        if (s.length < 5) return true; // Too short
        if (/[가-힣]/.test(s)) return true; // Korean in sentence text
        return false;
    });

    const badExamples = d.examples?.some(ex => /[가-힣]/.test(ex.word) || /[가-힣]/.test(ex.reading));

    return badSentences || badExamples;
});

console.log('Problematic N1/N2 count:', issues.length);
console.log(JSON.stringify(issues.map(d => d.kanji).slice(0, 50)));
fs.writeFileSync('detailed_issues.json', JSON.stringify(issues, null, 2));
