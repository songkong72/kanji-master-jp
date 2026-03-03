import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

const report = data.map(p => {
    const readings = {
        on: p.on_reading.split(/[,/]/).filter(r => r && r !== '-' && r !== ''),
        kun: p.kun_reading.split(/[,/]/).filter(r => r && r !== '-' && r !== '')
    };

    const errors = [];
    if (readings.on.length > 1 && !Array.isArray(p.on_sentence)) {
        errors.push(`on_sentence should be array (readings: ${readings.on.length})`);
    }
    if (readings.kun.length > 1 && !Array.isArray(p.kun_sentence)) {
        errors.push(`kun_sentence should be array (readings: ${readings.kun.length})`);
    }

    // Check examples coverage
    const exampleWords = p.examples.map(ex => ex.word);
    const missingKun = readings.kun.filter(r => {
        const base = r.split('.')[0];
        return !exampleWords.some(w => w.includes(base));
    });
    // This example check is a bit naive but helpful.

    return { id: p.id, kanji: p.kanji, category: p.category, errors };
}).filter(r => r.errors.length > 0);

console.log(JSON.stringify(report, null, 2));
console.log(`Total items violating "Multi-reading Multi-example" rule: ${report.length}`);
