const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let count = 0;
data.forEach(item => {
    let modified = false;

    // Build a map of word -> reading to fix sentences
    let wordMap = {};

    if (item.examples) {
        item.examples.forEach(e => {
            if (e.word && e.word !== '-' && !e.word.includes('](')) {
                if (e.reading && e.reading !== '-') {
                    wordMap[e.word] = e.reading;
                    e.word = `[${e.word}](${e.reading})`;
                    modified = true;
                }
            } else if (e.word && e.word.includes('](')) {
                // Already has ruby, maybe we can still extract it for sentences
                const bare = e.word.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
                const reading = e.word.replace(/\[[^\]]+\]\(([^\)]+)\)/g, '$1'); // this is naive but might work
                if (e.reading) wordMap[bare] = e.reading;
            }
        });
    }

    const processSentences = (sentences) => {
        if (!sentences) return;
        const arr = Array.isArray(sentences) ? sentences : [sentences];
        arr.forEach(s => {
            if (s && s.text && s.text !== '-' && !s.text.includes('](')) {
                let replaced = false;
                // Try to find the exact word from examples and replace it
                for (let bare in wordMap) {
                    if (s.text.includes(bare)) {
                        s.text = s.text.replace(new RegExp(bare, 'g'), `[${bare}](${wordMap[bare]})`);
                        replaced = true;
                    }
                }
                if (replaced) modified = true;
            }
        });
    }

    processSentences(item.on_sentence);
    processSentences(item.kun_sentence);

    if (modified) count++;
});

console.log('Modified entries:', count);
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
