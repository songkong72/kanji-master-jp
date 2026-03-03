const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let missingMeans = [];
let missingRubys = [];

d.forEach(k => {
    // 1. Missing means
    if (k.examples) k.examples.forEach(e => {
        if (e && e.mean === '의미 생략') missingMeans.push({ id: k.id, type: 'example', word: e.word || e.text });
    });
    const checkMean = (sentArr, type) => {
        if (!sentArr) return;
        if (!Array.isArray(sentArr)) sentArr = [sentArr];
        sentArr.forEach(s => {
            if (s && s.mean === '의미 생략') missingMeans.push({ id: k.id, type, text: s.text });
        });
    };
    checkMean(k.on_sentence, 'on_sentence');
    checkMean(k.kun_sentence, 'kun_sentence');

    // 2. Missing Rubys
    const checkRuby = (sentArr, type) => {
        if (!sentArr) return;
        if (!Array.isArray(sentArr)) sentArr = [sentArr];
        sentArr.forEach(s => {
            if (s && s.text && s.text !== '-') {
                const textNoRuby = s.text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '');
                if (/[一-龯]/.test(textNoRuby)) {
                    missingRubys.push({ id: k.id, type, text: s.text, mean: s.mean });
                }
            }
        });
    };
    checkRuby(k.on_sentence, 'on_sentence');
    checkRuby(k.kun_sentence, 'kun_sentence');
});

fs.writeFileSync('missing_means.json', JSON.stringify(missingMeans, null, 2));
fs.writeFileSync('missing_rubys.json', JSON.stringify(missingRubys, null, 2));

