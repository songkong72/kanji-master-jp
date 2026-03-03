const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let count = 0;
data.forEach(k => {
    if (k.examples) {
        k.examples.forEach(e => {
            if (e && e.word && typeof e.word === 'string') {
                if (e.word.includes('][')) {
                    // Replace [A][B](c) -> [AB](c)
                    e.word = e.word.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, '[$1$2]');
                    count++;
                }
            }
        });
    }

    // Also fix sentences
    const fixSents = (sents) => {
        if (!sents) return;
        if (!Array.isArray(sents)) sents = [sents];
        sents.forEach(s => {
            if (s && s.text && typeof s.text === 'string' && s.text.includes('][')) {
                s.text = s.text.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, '[$1$2]');
                count++;
            }
        });
    };
    fixSents(k.on_sentence);
    fixSents(k.kun_sentence);
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed nested/adjacent ruby brackets:', count);
