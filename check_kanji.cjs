const fs = require('fs');

const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let badSents = 0;
let missingTranslations = 0;
let badKanji = new Set();
let missingKanji = new Set();

d.forEach(k => {
    const check = (sentArr) => {
        if (!sentArr) return;
        if (!Array.isArray(sentArr)) sentArr = [sentArr];
        sentArr.forEach(s => {
            if (s && s.mean && (s.mean === '의미 생략' || s.mean === '의미생략')) {
                missingTranslations++;
                missingKanji.add(k.kanji);
            }

            if (s && s.text && s.text !== '-') {
                const textNoRuby = s.text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '');
                if (/[一-龯]/.test(textNoRuby)) {
                    badSents++;
                    badKanji.add(k.kanji);
                }
            }
        });
    };
    check(k.on_sentence);
    check(k.kun_sentence);
    if (k.examples) {
        k.examples.forEach(e => {
            if (e && e.mean && (e.mean === '의미 생략' || e.mean === '의미생략')) {
                missingTranslations++;
                missingKanji.add(k.kanji);
            }
        });
    }
});

console.log({ badSents, badKanjiSize: badKanji.size, missingTranslations, missingKanjiSize: missingKanji.size });
const bads = Array.from(badKanji);
console.log('Sample bad kanji for ruby:', bads.slice(0, 10));
const misses = Array.from(missingKanji);
// console.log('Sample kanjis needing translations:', misses);
// Save the set of bad inputs for further repair
fs.writeFileSync('bads.json', JSON.stringify({ bads, misses }, null, 2));

