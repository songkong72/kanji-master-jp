const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const badMeanings = ["배운다", "중요하다", "조사합니다", "사용한다", "글자를 보다", "외우다", "연습"];

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function splitRuby(text) {
    if (!text) return text;
    // [漢字](かんじ) -> [漢](かん)[字](지)
    return text.replace(/\[([^\]]{2,})\]\(([^)]+)\)/g, (match, kanjis, read) => {
        if (kanjis.length === read.length) {
            return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');
        }
        if (kanjis.length === 2) {
            const mid = Math.floor(read.length / 2);
            return `[${kanjis[0]}](${read.substring(0, mid)})[${kanjis[1]}](${read.substring(mid)})`;
        }
        return match;
    });
}

const templates = [
    { jp: "を[見](み)ました。", ko: "을(를) 보았습니다." },
    { jp: "を[確](かく)[認](にん)する。", ko: "을(를) 확인한다." },
    { jp: "を[習](なら)う。", ko: "을(를) 배운다." }, // Changed ko text slightly
    { jp: "が[知](し)られています。", ko: "가(이) 알려져 있습니다." }
];

data.forEach(d => {
    const process = (type) => {
        const readingStr = type === 'on' ? d.on_reading : d.kun_reading;
        if (!readingStr || readingStr === '-') return { text: "-", mean: "-" };

        const readings = readingStr.split(/[、/,\s]+/).filter(r => r && r !== '-');
        const uniqueHiraReadings = [...new Set(readings.map(kataToHira).map(r => r.split('.')[0]))];

        const originalSents = type === 'on' ? d.on_sentence : d.kun_sentence;
        let pool = (Array.isArray(originalSents) ? originalSents : [originalSents]).filter(s => s && s.text !== '-');

        const finalSents = [];
        const usedPoolIndices = new Set();

        uniqueHiraReadings.forEach((r, idx) => {
            let foundIdx = -1;
            // Rank 1: Exact Reading Match
            foundIdx = pool.findIndex((s, i) => !usedPoolIndices.has(i) && s.text.includes(`(${r})`));

            // Rank 2: Placeholder? (Avoid if possible)
            if (foundIdx === -1) {
                // Search in examples
                const matchingEx = d.examples.find(ex => {
                    const exR = ex.reading ? kataToHira(ex.reading) : "";
                    return exR === r || exR.includes(r);
                });

                const t = templates[Math.abs(d.id + idx) % templates.length];
                if (matchingEx) {
                    finalSents.push({
                        text: splitRuby(`[${matchingEx.word}](${matchingEx.reading})`) + t.jp,
                        mean: matchingEx.mean.replace(/\(음독\)|\(훈독\)/g, '').trim() + " " + t.ko
                    });
                } else {
                    finalSents.push({
                        text: `[${d.kanji}](${r})${t.jp}`,
                        mean: `${d.meaning.split(' ')[0]} ${t.ko}`
                    });
                }
            } else {
                usedPoolIndices.add(foundIdx);
                const s = pool[foundIdx];
                s.text = splitRuby(s.text);
                finalSents.push(s);
            }
        });

        return finalSents.length > 1 ? finalSents : (finalSents.length === 1 ? finalSents[0] : { text: "-", mean: "-" });
    };

    d.on_sentence = process('on');
    d.kun_sentence = process('kun');

    // Word list diversity check
    const allR = [
        ...d.on_reading.split(/[、/,\s]+/).filter(r => r && r !== '-').map(r => ({ r: r.split('.')[0], type: '음독' })),
        ...d.kun_reading.split(/[、/,\s]+/).filter(r => r && r !== '-').map(r => ({ r: r.split('.')[0], type: '훈독' }))
    ];

    allR.forEach(({ r, type }) => {
        const hiraR = kataToHira(r);
        const exists = d.examples.some(ex => {
            const exR = ex.reading ? kataToHira(ex.reading) : "";
            return exR === r || exR === hiraR || exR.includes(r) || exR.includes(hiraR);
        });
        if (!exists) {
            d.examples.push({
                word: d.kanji,
                reading: type === '음독' ? r : hiraR,
                mean: `${d.meaning.split(' ')[0]} (${type})`
            });
        }
    });

    // Remove any Korean particles inside text
    const cleanKo = s => { if (s && s.text) s.text = s.text.replace(/[가-힣]/g, '').trim(); };
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (Array.isArray(s)) s.forEach(cleanKo);
        else cleanKo(s);
    });
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Final Polish: 1:1 Parity and Split Ruby Enforced.');
