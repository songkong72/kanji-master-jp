const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function kataToHira(kata) {
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function cleanReading(r) {
    return r.split('.')[0].trim();
}

let totalAdded = 0;

data.forEach(d => {
    const onReadings = (d.on_reading || "").split(/[、/,\s]+/).filter(r => r && r !== '-').map(cleanReading);
    const kunReadings = (d.kun_reading || "").split(/[、/,\s]+/).filter(r => r && r !== '-').map(cleanReading);

    const allExpectedReadings = [
        ...onReadings.map(r => ({ r, type: '음독' })),
        ...kunReadings.map(r => ({ r, type: '훈독' }))
    ];

    const currentExampleReadings = d.examples.map(ex => {
        if (!ex.reading) return "";
        return ex.reading.replace(/[가-힣\s]/g, '');
    });

    const newExamples = [];

    allExpectedReadings.forEach(({ r, type }) => {
        const hiraR = kataToHira(r);
        // Does any example already cover this reading?
        const found = d.examples.some(ex => {
            if (!ex.reading) return false;
            const cleanExR = ex.reading.replace(/[가-힣\s]/g, '');
            return cleanExR.includes(r) || cleanExR.includes(hiraR);
        });

        if (!found) {
            // Check if we have a sentence we can grab a word from?
            const sents = type === '음독' ? d.on_sentence : d.kun_sentence;
            const sentList = (Array.isArray(sents) ? sents : [sents]).filter(s => s && s.text !== '-');

            let grabbed = false;
            for (const s of sentList) {
                // look for ruby like [Word](reading)
                const match = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (match && (match[2].includes(r) || match[2].includes(hiraR))) {
                    newExamples.push({
                        word: match[1],
                        reading: match[2],
                        mean: s.mean.split(/[.?!]/)[0].trim() + ` (${type})`
                    });
                    grabbed = true;
                    totalAdded++;
                    break;
                }
            }

            if (!grabbed) {
                // Last fallback: use the kanji itself
                newExamples.push({
                    word: d.kanji,
                    reading: (type === '음독' ? r : hiraR),
                    mean: `${d.meaning.split(' ')[0]} (${type})`
                });
                totalAdded++;
            }
        }
    });

    // Merge: we want ALL of d.examples PLUS any new ones we found missing
    // But we should avoid exact duplicates
    newExamples.forEach(ne => {
        if (!d.examples.some(ex => ex.word === ne.word && ex.reading === ne.reading)) {
            d.examples.push(ne);
        }
    });

    // Sorting: put matching ones first or just keep them? 
    // Usually nice to have a diverse set.
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Global Word List Enforcement: Added ${totalAdded} example words to match all readings across 1058 kanjis.`);
