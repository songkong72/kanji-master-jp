const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper to convert katakana to hiragana
function kataToHira(str) {
    if (!str) return "";
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

function processText(text, kanjiStr, readingsHira) {
    if (!text || typeof text !== 'string') return text;

    // Process all [WORD](reading) instances
    const regex = /\[([^\]]+)\]\(([^\)]+)\)/g;

    return text.replace(regex, (match, word, reading) => {
        // If the word doesn't contain the kanji, leave it as is
        let kIndex = word.indexOf(kanjiStr);
        if (kIndex === -1) return match;

        // If word is just the kanji, it's already isolated
        if (word === kanjiStr) return match;

        let foundReading = null;
        let isPrefix = false;
        let isSuffix = false;

        for (let r of readingsHira) {
            if (!r) continue;
            // Clean up reading (remove '.' like in た.べる)
            let cleanR = r.replace(/\./g, '');
            if (!cleanR) continue;

            // Check if reading matches
            if (kIndex === 0 && reading.startsWith(cleanR)) {
                foundReading = cleanR;
                isPrefix = true;
                break;
            } else if (kIndex === word.length - 1 && reading.endsWith(cleanR)) {
                foundReading = cleanR;
                isSuffix = true;
                break;
            } else if (reading.includes(cleanR)) {
                // Approximate for middle kanji
                foundReading = cleanR;
                break;
            }
        }

        if (!foundReading) {
            return match; // Couldn't confidently isolate
        }

        if (isPrefix) {
            const restWord = word.slice(kanjiStr.length);
            const restReading = reading.slice(foundReading.length);
            if (restWord.length > 0) {
                return `[${kanjiStr}](${foundReading})[${restWord}](${restReading})`;
            }
        } else if (isSuffix) {
            const firstWord = word.slice(0, kIndex);
            const firstReading = reading.slice(0, reading.length - foundReading.length);
            if (firstWord.length > 0) {
                return `[${firstWord}](${firstReading})[${kanjiStr}](${foundReading})`;
            }
        } else {
            // Middle case (rough split)
            const rIndex = reading.indexOf(foundReading);
            if (rIndex > 0) {
                const firstWord = word.slice(0, kIndex);
                const firstReading = reading.slice(0, rIndex);

                const lastWord = word.slice(kIndex + kanjiStr.length);
                const lastReading = reading.slice(rIndex + foundReading.length);

                let res = `[${firstWord}](${firstReading})[${kanjiStr}](${foundReading})`;
                if (lastWord.length > 0) {
                    res += `[${lastWord}](${lastReading})`;
                }
                return res;
            }
        }

        return match;
    });
}

let modifiedCount = 0;

data.forEach(item => {
    let readings = [];
    if (item.kun_reading && item.kun_reading !== '-') readings = readings.concat(item.kun_reading.split('/'));
    if (item.on_reading && item.on_reading !== '-') readings = readings.concat(item.on_reading.split('/'));

    const readingsHira = readings.map(r => kataToHira(r.trim()));

    let modified = false;

    const tryProcess = (sentences) => {
        if (!sentences) return;
        const arr = Array.isArray(sentences) ? sentences : [sentences];
        arr.forEach(s => {
            if (s && s.text) {
                const newText = processText(s.text, item.kanji, readingsHira);
                if (newText !== s.text) {
                    s.text = newText;
                    modified = true;
                }
            }
        });
    };

    tryProcess(item.on_sentence);
    tryProcess(item.kun_sentence);
    if (item.examples) { // I accidentally added [A][B](ab) in my bulk script. That regex won't catch [A][B] because it's not [A](..). Oh wait, my bulk script did NOT do [A][B](ab). wait, I did! Let me fix bulk examples if any.
        item.examples.forEach(e => {
            if (e.word && e.word.includes('](')) {
                const newWord = processText(e.word, item.kanji, readingsHira);
                if (newWord !== e.word) {
                    e.word = newWord;
                    modified = true;
                }
            } else if (e.word && e.word.includes('][')) {
                // Fix the ugly string "[結][実](けつじつ)"
                const uglyRegex = /\[([^\]]+)\]\[([^\]]+)\]\(([^\)]+)\)/g;
                const newW = e.word.replace(uglyRegex, (m, w1, w2, r) => {
                    let wordData = w1 + w2;
                    return processText(`[${wordData}](${r})`, item.kanji, readingsHira);
                });
                if (newW !== e.word) {
                    e.word = newW;
                    modified = true;
                }
            }
        });
    }

    // Try to catch the ugly ones in sentences too
    const tryProcessUgly = (sentences) => {
        if (!sentences) return;
        const arr = Array.isArray(sentences) ? sentences : [sentences];
        arr.forEach(s => {
            if (s && s.text && s.text.includes('][')) {
                const uglyRegex = /\[([^\]]+)\]\[([^\]]+)\]\(([^\)]+)\)/g;
                const newText = s.text.replace(uglyRegex, (m, w1, w2, r) => {
                    let wordData = w1 + w2;
                    return processText(`[${wordData}](${r})`, item.kanji, readingsHira);
                });
                if (newText !== s.text) {
                    s.text = newText;
                    modified = true;
                }
            }
        });
    };
    tryProcessUgly(item.on_sentence);
    tryProcessUgly(item.kun_sentence);

    if (modified) modifiedCount++;
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Isolated target kanji ruby in ${modifiedCount} entries.`);
