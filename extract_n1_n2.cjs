const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const kanjiRegex = /[\u4e00-\u9faf]/;

const hasIssue = (text) => {
    if (!text) return true;
    if (text.includes('通常訓読') || text.includes('通常音読')) return false;
    if (text === 'なし' || text === '없음') return false;

    const cleanText = text.replace(/\[[^\]]*\]\([^\)]*\)/g, '');
    return kanjiRegex.test(cleanText);
};

const issues = [];

data.forEach(d => {
    if (d.category === 'N2' || d.category === 'N1') {
        if (hasIssue(d.on_sentence?.text) || hasIssue(d.kun_sentence?.text)) {
            issues.push({
                kanji: d.kanji,
                on: d.on_sentence?.text,
                kun: d.kun_sentence?.text
            });
        }
    }
});

fs.writeFileSync('ruby_n1_n2.json', JSON.stringify(issues, null, 2));
