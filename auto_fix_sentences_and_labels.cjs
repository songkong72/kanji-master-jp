const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

// Helper for katakana to hiragana
function kataToHira(kata) {
    return kata.replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

// Map readings for Onyomi and Kunyomi checking
function getReadings(d) {
    const on = new Set();
    const kun = new Set();
    if (d.on_reading) {
        d.on_reading.split(/[、/,\s]+/).forEach(r => {
            if (r && r !== '-') on.add(kataToHira(r.trim()));
        });
    }
    if (d.kun_reading) {
        d.kun_reading.split(/[、/,\s]+/).forEach(r => {
            if (r && r !== '-') {
                kun.add(r.split('.')[0].trim());
            }
        });
    }
    return { on, kun };
}

let fixedLabels = 0;
let fixedSentences = 0;

data.forEach(d => {
    const { on, kun } = getReadings(d);

    // 1. Fix missing labels
    d.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)') && !ex.mean.includes('(특수)')) {
            // Very basic heuristic
            // Check if word contains any kanji that has a matching reading, or purely fallback
            let isOn = false;
            let isKun = false;

            const charArray = ex.word.split('');
            if (charArray.includes(d.kanji)) {
                // If length > 1 and mostly kanji, usually ON
                if (ex.word.length > 1 && !/[ぁ-ん]/.test(ex.word)) {
                    isOn = true;
                } else if (/[ぁ-ん]/.test(ex.word)) {
                    isKun = true;
                } else {
                    // fallback checks
                    for (let r of on) { if (ex.reading && ex.reading.includes(r)) isOn = true; }
                    for (let r of kun) { if (ex.reading && ex.reading.includes(r)) isKun = true; }
                }
            }

            // Default fallback
            if (isOn) ex.mean += ' (음독)';
            else if (isKun) ex.mean += ' (훈독)';
            else {
                // Default to ON if mostly Kanji
                if (!/[ぁ-ん]/.test(ex.word) && ex.word.length > 1) ex.mean += ' (음독)';
                else ex.mean += ' (훈독)';
            }
            fixedLabels++;
        }
    });

    // 2. Fix bad sentences
    // Finds a suitable example word for ON and KUN
    const onWords = d.examples.filter(e => e.mean.includes('(음독)'));
    const kunWords = d.examples.filter(e => e.mean.includes('(훈독)'));

    function isBadSentence(s) {
        if (!s || !s.text) return true;
        return s.text.length < 5 || s.text.includes('()') || s.text.includes('( )') || /\[.\]\([^)]*\)[。\.]$/.test(s.text);
    }

    function fixSentence(s, type) {
        if (isBadSentence(s)) {
            fixedSentences++;
            if (type === 'on') {
                const word = onWords.length > 0 ? onWords[0] : (d.examples.length > 0 ? d.examples[0] : null);
                if (word && word.reading) {
                    s.text = `[${word.word}](${word.reading})を覚(おぼ)える。`;
                    s.mean = `${word.mean.replace(/\(음독\)|\(훈독\)|\(특수\)/g, '').trim()} 단어를 배운다.`;
                } else {
                    s.text = `[${d.kanji}](${on.size > 0 ? Array.from(on)[0] : 'こう'})という漢字(かんじ)。`;
                    s.mean = `${d.kanji}라는 한자.`;
                }
            } else {
                const word = kunWords.length > 0 ? kunWords[0] : (d.examples.length > 0 ? d.examples[0] : null);
                if (word && word.reading) {
                    // Handle okurigana correctly if word contains hiragana
                    if (/[ぁ-ん]/.test(word.word)) {
                        // Find where kanji stops and hiragana starts
                        const kanjiPart = word.word.replace(/[ぁ-ん]/g, '');
                        const hiraPart = word.word.replace(/[\u4e00-\u9faf]/g, '');
                        const readingKanji = word.reading.replace(hiraPart, '');
                        if (kanjiPart && readingKanji) {
                            s.text = `[${kanjiPart}](${readingKanji})${hiraPart}ことが大切(たいせつ)だ。`;
                        } else {
                            s.text = `[${word.word}](${word.reading})ことが大切(たいせつ)だ。`;
                        }
                    } else {
                        s.text = `[${word.word}](${word.reading})を使(つか)う。`;
                    }
                    s.mean = `${word.mean.replace(/\(음독\)|\(훈독\)|\(특수\)/g, '').trim()}는(은) 중요하다/사용한다.`;
                } else {
                    s.text = `[${d.kanji}](${kun.size > 0 ? Array.from(kun)[0] : 'こう'})という訓読(くんどく)。`;
                    s.mean = `${d.kanji}라는 훈독.`;
                }
            }
        }
    }

    if (Array.isArray(d.on_sentence)) {
        d.on_sentence.forEach(s => fixSentence(s, 'on'));
    } else {
        fixSentence(d.on_sentence, 'on');
    }

    if (Array.isArray(d.kun_sentence)) {
        d.kun_sentence.forEach(s => fixSentence(s, 'kun'));
    } else {
        fixSentence(d.kun_sentence, 'kun');
    }
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedLabels} missing labels and ${fixedSentences} bad sentences.`);
