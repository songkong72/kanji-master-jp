const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let count = 0;
d.forEach(k => {
    const processSents = (sents) => {
        if (!sents) return;
        if (!Array.isArray(sents)) sents = [sents];
        sents.forEach(s => {
            if (!s || !s.text || typeof s.text !== 'string' || s.text === '-') return;
            // Get length of string disregarding ruby formatting and tags
            const textNoRuby = s.text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

            // Check if sentence lacks verb or adjective endings, or is just a single word ending in 。
            // Examples like 正答。 or [正答](せいとう)。 or これ。[正答](せいとう)。
            if (s.text.match(/^\[([^\]]+)\]\([^\)]+\)だ?。?$/) || textNoRuby.match(/^[一-龯ぁ-んァ-ン]+(だ|です)?。?$/) && textNoRuby.length <= 6 && !textNoRuby.includes('を') && !textNoRuby.includes('に') && !textNoRuby.includes('は') && !textNoRuby.includes('が') && !textNoRuby.includes('へ')) {
                console.log(k.kanji, s.text, ' -> ', s.mean);
                count++;
            }
        });
    };
    processSents(k.on_sentence);
    processSents(k.kun_sentence);
});
console.log('Short sentences count:', count);
