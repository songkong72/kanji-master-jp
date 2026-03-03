const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));
const kanjiRegex = /[\u4e00-\u9faf]/;

const hasIssue = (text) => {
    if (!text) return true;
    if (text.includes('通常訓読') || text.includes('通常音読')) return false;
    if (text === 'なし' || text === '없음') return false;
    const cleanText = text.replace(/\[[^\]]*\]\([^\)]*\)/g, '');
    return kanjiRegex.test(cleanText) || text.length <= 10;
};

const n2_issues = data.filter(d =>
    d.category === 'N2' && (hasIssue(d.on_sentence?.text) || hasIssue(d.kun_sentence?.text))
);

console.log('Total N2 issues found:', n2_issues.length);
console.log(JSON.stringify(n2_issues.map(d => d.kanji).slice(0, 50)));
