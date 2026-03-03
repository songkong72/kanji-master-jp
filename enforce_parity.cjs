const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function splitRuby(text) {
    if (!text) return text;
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
    { jp: "を[確](かく)[認](에)[認](にん)する。", ko: "을(를) 확인한다." },
    { jp: "が[知](し)られています。", ko: "가(이) 알려져 있습니다." }
];
// Fix template typo
templates[1].jp = "を[確](かく)[認](にん)する。";

data.forEach(d => {
    const processSet = (type) => {
        const readingStr = type === 'on' ? d.on_reading : d.kun_reading;
        if (!readingStr || readingStr === '-') return { text: "-", mean: "-" };

        // Split by / or 、 but DO NOT deduplicate if they were listed separately
        const readings = readingStr.split(/[、/]+/).map(r => r.trim()).filter(r => r && r !== '-');

        const originalSents = type === 'on' ? d.on_sentence : d.kun_sentence;
        let pool = (Array.isArray(originalSents) ? originalSents : [originalSents]).filter(s => s && s.text !== '-');

        const finalSents = [];
        const usedIndices = new Set();

        readings.forEach((rawR, idx) => {
            const cleanR = rawR.split('.')[0];
            const hiraR = kataToHira(cleanR);

            let foundIdx = -1;
            // Best match: exact match of reading in ruby
            foundIdx = pool.findIndex((s, i) => !usedIndices.has(i) && (s.text.includes(`(${cleanR})`) || s.text.includes(`(${hiraR})`)));

            if (foundIdx !== -1) {
                usedIndices.add(foundIdx);
                const s = pool[foundIdx];
                s.text = splitRuby(s.text);
                finalSents.push(s);
            } else {
                // Try examples
                const matchingEx = d.examples.find(ex => {
                    const exR = ex.reading ? kataToHira(ex.reading) : "";
                    return exR === cleanR || exR === hiraR || exR.includes(cleanR) || exR.includes(hiraR);
                });

                const t = templates[Math.abs(d.id + idx) % templates.length];
                if (matchingEx) {
                    finalSents.push({
                        text: splitRuby(`[${matchingEx.word}](${matchingEx.reading})`) + t.jp,
                        mean: matchingEx.mean.replace(/\(음독\)|\(훈독\)/g, '').trim() + " " + t.ko
                    });
                } else {
                    finalSents.push({
                        text: `[${d.kanji}](${hiraR})${t.jp}`,
                        mean: `${d.meaning.split(' ')[0]} ${t.ko}`
                    });
                }
            }
        });

        // Ensure text is clean of Korean
        finalSents.forEach(s => { s.text = s.text.replace(/[가-힣]/g, '').trim(); });

        return finalSents.length > 1 ? finalSents : (finalSents.length === 1 ? finalSents[0] : { text: "-", mean: "-" });
    };

    d.on_sentence = processSet('on');
    d.kun_sentence = processSet('kun');
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Parity Enforced: Each slash reading now has its own sentence card.');
