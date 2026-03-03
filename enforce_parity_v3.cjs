const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

function getBase(reading) {
    return reading.split('.')[0].trim();
}

data.forEach(d => {
    // 1. Clean and deduplicate readings (Remove 'inflections/활용형' after '.')
    const processReadings = (type) => {
        const raw = type === 'on' ? d.on_reading : d.kun_reading;
        if (!raw || raw === '-') return "-";

        const parts = raw.split(/[、/]+/).map(p => p.trim()).filter(p => p && p !== '-');
        const uniqueBases = [];
        const seen = new Set();

        parts.forEach(p => {
            const base = getBase(p);
            if (!seen.has(base)) {
                uniqueBases.push(base);
                seen.add(base);
            }
        });

        return uniqueBases.join(' / ');
    };

    const oldOn = d.on_reading;
    const oldKun = d.kun_reading;

    d.on_reading = processReadings('on');
    d.kun_reading = processReadings('kun');

    // Special Cases (Force override for Ten/Nine based on user feedback)
    if (d.id === 11) { // 十
        d.on_reading = "ジュウ / ジッ / ジュッ";
        d.kun_reading = "とお / と";
    }
    if (d.id === 10) { // 九
        d.on_reading = "キュウ / ク";
        d.kun_reading = "ここの";
    }

    // 2. Enforce 1:1 Parity with these new clean readings
    const alignSentences = (type) => {
        const readingStr = type === 'on' ? d.on_reading : d.kun_reading;
        if (!readingStr || readingStr === '-') return { text: "-", mean: "-" };

        const readings = readingStr.split(' / ');
        const originalSents = type === 'on' ? d.on_sentence : d.kun_sentence;
        let pool = (Array.isArray(originalSents) ? originalSents : [originalSents]).filter(s => s && s.text !== '-');

        const finalSents = [];
        const usedIndices = new Set();

        readings.forEach((r, idx) => {
            const hiraR = kataToHira(r);
            let foundIdx = -1;

            // Try to find an existing sentence that features this base reading
            foundIdx = pool.findIndex((s, i) => !usedIndices.has(i) && (s.text.includes(`(${r})`) || s.text.includes(`(${hiraR})`)));

            if (foundIdx !== -1) {
                usedIndices.add(foundIdx);
                finalSents.push(pool[foundIdx]);
            } else {
                // Fallback: Create from examples or template
                const matchEx = d.examples.find(ex => {
                    const exR = kataToHira(ex.reading);
                    return exR === r || exR === hiraR || exR.startsWith(r) || exR.startsWith(hiraR);
                });
                if (matchEx) {
                    finalSents.push({
                        text: `[${matchEx.word}](${matchEx.reading})を[見](み)ました。`,
                        mean: `${matchEx.mean.replace(/\(음독\)|\(훈독\)/g, '').trim()} 을(를) 보았습니다.`
                    });
                } else {
                    finalSents.push({
                        text: `[${d.kanji}](${type === 'on' ? r : hiraR})を[見](み)る。`,
                        mean: `${d.meaning.split(' ')[0]} 글자를 보다.`
                    });
                }
            }
        });

        return finalSents.length > 1 ? finalSents : (finalSents.length === 1 ? finalSents[0] : { text: "-", mean: "-" });
    };

    d.on_sentence = alignSentences('on');
    d.kun_sentence = alignSentences('kun');

    // Final Cleanup: Remove any remaining Korean in text fields
    const cleanKo = s => { if (s && s.text) s.text = s.text.replace(/[가-힣]/g, '').trim(); };
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (Array.isArray(s)) s.forEach(cleanKo);
        else cleanKo(s);
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log('Parity V3: Inflections (okurigana) removed from header. Global 1:1 match enforced.');
