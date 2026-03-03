const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));
const kanjiRegex = /[\u4e00-\u9faf]/;
const hasIssue = text => {
    if (!text) return true;
    if (text.includes('通常訓読') || text.includes('通常音読')) return false;
    if (text === 'なし' || text === '없음') return false;
    const cleanText = text.replace(/\[[^\]]*\]\([^\)]*\)/g, '');
    return kanjiRegex.test(cleanText);
};
const n1_issues = data.filter(d =>
    d.category === 'N1' && (hasIssue(d.on_sentence?.text) || hasIssue(d.kun_sentence?.text) || d.on_sentence.text.length < 10)
);
console.log('N1 issues count:', n1_issues.length);
process.stdout.write(JSON.stringify(n1_issues.map(d => d.kanji).slice(0, 50)));
