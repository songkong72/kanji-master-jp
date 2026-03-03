const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

let n2_issues = 0;
let n1_issues = 0;

const kanjiRegex = /[\u4e00-\u9faf]/;

const hasIssue = (text) => {
    if (!text) return true;
    if (text.includes('通常訓読') || text.includes('通常音読')) return false; // Allowed exceptions
    if (text === 'なし' || text === '없음') return false; // Handled

    // Remove ruby brackets
    const cleanText = text.replace(/\[[^\]]*\]\([^\)]*\)/g, '');

    // If there's still a kanji left in the clean text, it means a kanji missed a ruby annotation
    return kanjiRegex.test(cleanText);
};

data.forEach(d => {
    if (d.category === 'N2') {
        if (hasIssue(d.on_sentence?.text) || hasIssue(d.kun_sentence?.text)) {
            n2_issues++;
        }
    }
    if (d.category === 'N1') {
        if (hasIssue(d.on_sentence?.text) || hasIssue(d.kun_sentence?.text)) {
            n1_issues++;
        }
    }
});

console.log('N2 with ruby missing or errors:', n2_issues);
console.log('N1 with ruby missing or errors:', n1_issues);
