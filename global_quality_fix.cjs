const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

const badMeanings = ["배운다", "중요하다", "조사합니다", "사용한다", "미입력", "미공개"];

function kataToHira(kata) {
    return kata.replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

function splitRuby(text, dict) {
    if (!text) return text;
    // 1. First split any unsplit blocks using a common map or simple 1:1 heuristic
    // e.g. [振動](しんどう) -> [振](しん)[動](どう)
    let result = text.replace(/\[([^\]]{2,})\]\(([^)]+)\)/g, (match, kanjis, read) => {
        if (kanjis.length === read.length) {
            return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');
        }
        // Simple 1:2 check for cases like 'koku', 'sin'
        if (kanjis.length * 2 === read.length) {
            let res = '';
            for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${read.substring(i * 2, i * 2 + 2)})`;
            return res;
        }
        // If not 1:1 or 1:2, we try to preserve it but split manually if in our small internal dict or if it's just 2 kanjis and read is divisible by 2
        if (kanjis.length === 2) {
            const mid = Math.floor(read.length / 2);
            return `[${kanjis[0]}](${read.substring(0, mid)})[${kanjis[1]}](${read.substring(mid)})`;
        }
        return match;
    });
    return result;
}

const actionSentences = [
    { text: "을(를) 보았습니다.", jp: "を[見](み)ました。" },
    { text: "을(를) 좋아합니다.", jp: "が[好](す)きです。" },
    { text: "을(를) 배웁니다.", jp: "を[学](まな)びます。" },
    { text: "을(를) 알고 있습니다.", jp: "を[知](し)っています。" },
    { text: "을(를) 찾고 있습니다.", jp: "を[探](さが)しています。" },
];

function getCleanMean(mean) {
    return mean.replace(/\(음독\)|\(훈독\)|\(특수\)/g, '').trim();
}

let fixedSentences = 0;

data.forEach(d => {
    const readings = {
        on: (d.on_reading || "").split(/[、/,\s]+/).filter(r => r && r !== '-').map(kataToHira),
        kun: (d.kun_reading || "").split(/[、/,\s]+/).filter(r => r && r !== '-').map(r => r.split('.')[0])
    };

    const processSentenceList = (list, type) => {
        let currentList = (Array.isArray(list) ? list : [list]).filter(s => s && s.text !== '-');
        const targetCount = type === 'on' ? readings.on.length : readings.kun.length;

        // 1. Mark placeholders for redo
        currentList = currentList.map(s => {
            if (badMeanings.some(bad => s.mean && s.mean.includes(bad)) || s.text.includes('()') || s.text.includes('( )')) {
                return null;
            }
            return s;
        }).filter(x => x);

        // 2. Supplement missing readings
        const currentReadingsInSents = currentList.map(s => {
            const m = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
            return m ? m[2] : "";
        });

        const targetReadings = type === 'on' ? readings.on : readings.kun;

        targetReadings.forEach(r => {
            if (!currentReadingsInSents.some(cr => cr.includes(r))) {
                // Find an example word matching this reading
                const matchingEx = d.examples.find(ex => ex.reading && ex.reading.includes(r));
                let s;
                if (matchingEx) {
                    const idx = Math.abs(d.id) % actionSentences.length;
                    const act = actionSentences[idx];
                    // Simple 1:1 split for common words in examples
                    let splitWord = matchingEx.word;
                    if (matchingEx.word.length === 2 && matchingEx.reading.length >= 2) {
                        const mid = Math.floor(matchingEx.reading.length / 2);
                        splitWord = `[${matchingEx.word[0]}](${matchingEx.reading.substring(0, mid)})[${matchingEx.word[1]}](${matchingEx.reading.substring(mid)})`;
                    } else {
                        splitWord = `[${matchingEx.word}](${matchingEx.reading})`;
                    }
                    s = {
                        text: splitWord + act.jp,
                        mean: getCleanMean(matchingEx.mean) + " " + act.text
                    };
                } else {
                    // Extreme Fallback
                    s = {
                        text: `[${d.kanji}](${r})を[見](み)る。`,
                        mean: `${d.meaning.split(' ')[0]} 글자를 보다.`
                    };
                }
                currentList.push(s);
                fixedSentences++;
            }
        });

        // 3. Last chance fix: if list is still empty but reading exists
        if (currentList.length === 0 && targetReadings.length > 0) {
            const r = targetReadings[0];
            currentList.push({
                text: `[${d.kanji}](${r})を[覚](おぼ)える。`,
                mean: `${d.meaning.split(' ')[0]} 글자를 외우다.`
            });
            fixedSentences++;
        }

        // 4. Split all ruby and return
        return currentList.map(s => {
            s.text = splitRuby(s.text);
            return s;
        });
    };

    d.on_sentence = processSentenceList(d.on_sentence, 'on');
    if (d.on_sentence.length === 1) d.on_sentence = d.on_sentence[0];
    if (d.on_sentence.length === 0) d.on_sentence = { text: "-", mean: "-" };

    d.kun_sentence = processSentenceList(d.kun_sentence, 'kun');
    if (d.kun_sentence.length === 1) d.kun_sentence = d.kun_sentence[0];
    if (d.kun_sentence.length === 0) d.kun_sentence = { text: "-", mean: "-" };

    // Example list split check
    d.examples.forEach(ex => {
        if (ex.word.length > 1 && !ex.reading.includes(' ')) {
            // if it's 2 kanjis and reading is even, split 1:1
            if (ex.word.length === 2 && !/[ぁ-ん]/.test(ex.word)) {
                const mid = Math.floor(ex.reading.length / 2);
                // Only if it's not already split
            }
        }
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log(`Global Quality Remediation Complete: ${fixedSentences} sentences rebuilt/supplemented.`);
