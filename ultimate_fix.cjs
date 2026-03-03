const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

function kataToHira(kata) {
    return kata.replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

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

let fixedSentences = 0;
let fixedLabels = 0;
let fixedKorean = 0;
let fixedDummy = 0;

data.forEach(d => {
    const { on, kun } = getReadings(d);

    // 1. Clean dummy or malformed examples
    const originalLen = d.examples.length;
    d.examples = d.examples.filter(ex => {
        if (ex.word === d.kanji) {
            // Katakana only reading -> remove
            if (/^[\u30A0-\u30FF]+$/.test(ex.reading)) return false;
            // Meaning ends with ~할 -> remove
            if (/([할일를을칠릴될][ \t]*\()?/.test(ex.mean) && ex.mean.includes('(음독)')) return false;
        }
        return true;
    });
    fixedDummy += (originalLen - d.examples.length);

    // 2. Fix Korean in readings
    d.examples.forEach(ex => {
        if (/[가-힣]/.test(ex.reading)) {
            if (!/[ぁ-んァ-ン]/.test(ex.reading) && /[ぁ-んァ-ン]/.test(ex.mean)) {
                const t = ex.reading; ex.reading = ex.mean; ex.mean = t;
            } else {
                ex.reading = ex.reading.replace(/[가-힣\s]/g, '');
            }
            fixedKorean++;
        }

        // 3. Fix labels
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)') && !ex.mean.includes('(특수)')) {
            let isOn = false;
            let isKun = false;
            if (ex.word.length > 1 && !/[ぁ-ん]/.test(ex.word)) isOn = true;
            else if (/[ぁ-ん]/.test(ex.word)) isKun = true;
            else {
                for (let r of on) { if (ex.reading && ex.reading.includes(r)) isOn = true; }
                for (let r of kun) { if (ex.reading && ex.reading.includes(r)) isKun = true; }
            }
            if (isOn) ex.mean += ' (음독)';
            else if (isKun) ex.mean += ' (훈독)';
            else ex.mean += (ex.word.length > 1 && !/[ぁ-ん]/.test(ex.word)) ? ' (음독)' : ' (훈독)';
            fixedLabels++;
        }
    });

    // 4. Fix Sentences
    const onWords = d.examples.filter(e => e.mean.includes('(음독)'));
    const kunWords = d.examples.filter(e => e.mean.includes('(훈독)'));

    function isBadSentence(s, type) {
        if (!s || !s.text) return true;
        if ((type === 'on' && on.size === 0) || (type === 'kun' && kun.size === 0)) return false; // Allowed to be empty if no reading
        return s.text.length < 5 || s.text.includes('()') || s.text.includes('( )') || /\[.\]\([^)]*\)[。\.]$/.test(s.text);
    }

    function createSentence(type) {
        let s = { text: '', mean: '' };
        if (type === 'on') {
            if (on.size === 0) { s.text = '-'; s.mean = '-'; return s; }
            const word = onWords.length > 0 ? onWords[0] : (d.examples.length > 0 ? d.examples[0] : null);
            if (word && word.reading) {
                s.text = `[${word.word}](${word.reading})を覚(おぼ)える。`;
                s.mean = `${word.mean.replace(/\(음독\)|\(훈독\)|\(특수\)/g, '').trim()} 단어를 배운다.`;
            } else {
                s.text = `[${d.kanji}](${on.size > 0 ? Array.from(on)[0] : 'こう'})という漢字(かんじ)。`;
                s.mean = `${d.kanji}라는 한자.`;
            }
        } else {
            if (kun.size === 0) { s.text = '-'; s.mean = '-'; return s; }
            const word = kunWords.length > 0 ? kunWords[0] : (d.examples.length > 0 ? d.examples[0] : null);
            if (word && word.reading) {
                if (/[ぁ-ん]/.test(word.word)) {
                    const hiraPart = word.word.replace(/[\u4e00-\u9faf]/g, '');
                    const kanjiPart = word.word.replace(/[ぁ-ん]/g, '');
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
        return s;
    }

    function processSentence(s, type) {
        if (!s) s = { text: '', mean: '' };
        if (type === 'on' && on.size === 0) { s.text = '-'; s.mean = '-'; return s; }
        if (type === 'kun' && kun.size === 0) { s.text = '-'; s.mean = '-'; return s; }

        if (isBadSentence(s, type)) {
            fixedSentences++;
            const newS = createSentence(type);
            s.text = newS.text;
            s.mean = newS.mean;
        }
        return s;
    }

    if (Array.isArray(d.on_sentence)) {
        d.on_sentence = d.on_sentence.map(s => processSentence(s, 'on'));
    }
    else { d.on_sentence = processSentence(d.on_sentence, 'on'); }

    if (Array.isArray(d.kun_sentence)) {
        d.kun_sentence = d.kun_sentence.map(s => processSentence(s, 'kun'));
    }
    else { d.kun_sentence = processSentence(d.kun_sentence, 'kun'); }

    // Overrides for specific issues mentioned by user
    if (d.kanji === '捜') {
        if (!Array.isArray(d.on_sentence)) d.on_sentence = { text: '[犯](はん)[人](にん)の[行](ゆく)[方](え)を[捜](そう)[索](さく)する。', mean: '범인의 행방을 수색하다.' };
        if (!Array.isArray(d.kun_sentence)) d.kun_sentence = { text: '[家](いえ)の[中](なか)を[捜](さが)す。', mean: '집 안을 샅샅이 찾다.' };
        if (!d.examples.find(e => e.word === '捜す')) d.examples.push({ word: '捜す', reading: 'さがす', mean: '찾다 (훈독)' });
    }
    if (d.kanji === '探') {
        if (!Array.isArray(d.on_sentence)) d.on_sentence = { text: '[深](ふか)い[海](うみ)を[探](たん)[検](けん)する。', mean: '깊은 바다를 탐험하다.' };
        d.kun_sentence = [
            { text: '[森](もり)の[中](なか)で[宝](たから)を[探](さが)す。', mean: '숲 속에서 보물을 찾다.' },
            { text: '[犯](はん)[人](にん)の[行](ゆく)[方](え)を[探](さぐ)る。', mean: '범인의 행방을 살피다.' }
        ];
        if (!d.examples.find(e => e.word === '探検')) d.examples.push({ word: '探検', reading: 'たんけん', mean: '탐험 (음독)' });
        if (!d.examples.find(e => e.word === '探求')) d.examples.push({ word: '探求', reading: 'たんきゅう', mean: '탐구 (음독)' });
        if (!d.examples.find(e => e.word === '探す')) d.examples.push({ word: '探す', reading: 'さがす', mean: '찾다 (훈독)' });
        if (!d.examples.find(e => e.word === '探る')) d.examples.push({ word: '探る', reading: 'さぐる', mean: '살피다, 더듬어 찾다 (훈독)' });
        // Cleanup any duplicates
        const seen = new Set();
        d.examples = d.examples.filter(e => {
            if (seen.has(e.word)) return false;
            seen.add(e.word);
            if (e.word === 'タン' || e.word === 'さがす') return false;
            return true;
        });
    }
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log(`Ultimate fix: ${fixedSentences} sentences, ${fixedLabels} labels, ${fixedKorean} korean reading errors, ${fixedDummy} dummy words.`);
