const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

let totalRemoved = 0;

data.forEach(d => {
    if (!d.examples || d.examples.length <= 1) return;

    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => k2h(r.trim().toLowerCase()).split('.')[0]);
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim().toLowerCase().split('.')[0]);

    const seenReadings = new Set();
    const newExamples = [];

    d.examples.forEach(ex => {
        // Identify which reading this example covers
        let matchedReading = null;
        let category = '';

        // Check On readings
        for (const p of ons) {
            if (ex.reading.startsWith(p)) {
                matchedReading = p;
                category = 'ON';
                break;
            }
        }

        // Check Kun readings (if not matched or to prefer Kun if ambiguous)
        if (!matchedReading) {
            for (const p of kuns) {
                if (ex.reading.startsWith(p)) {
                    matchedReading = p;
                    category = 'KUN';
                    break;
                }
            }
        }

        if (matchedReading) {
            const key = `${category}:${matchedReading}`;
            if (!seenReadings.has(key)) {
                seenReadings.add(key);
                newExamples.push(ex);
            } else {
                totalRemoved++;
            }
        } else {
            // If it doesn't match any known reading (e.g. giseigo, ateji), keep it for now
            newExamples.push(ex);
        }
    });

    if (newExamples.length !== d.examples.length) {
        d.examples = newExamples;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Deduplicated examples. Total redundant examples removed: ${totalRemoved}`);
