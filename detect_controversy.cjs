const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const matches = data.filter(d => {
    if (d.category !== 'N1' && d.category !== 'N2') return false;

    // Check if kun_reading exists but kun_sentence uses the "not used" message
    const hasKunReading = d.kun_reading && d.kun_reading !== '-';
    const usesNotUsedMessage = d.kun_sentence?.text?.includes('通常') && d.kun_sentence?.text?.includes('訓読');

    // Check if on_reading exists but on_sentence uses the "not used" message
    const hasOnReading = d.on_reading && d.on_reading !== '-';
    const usesNotUsedOnMessage = d.on_sentence?.text?.includes('通常') && d.on_sentence?.text?.includes('音読');

    return (hasKunReading && usesNotUsedMessage) || (hasOnReading && usesNotUsedOnMessage);
});

console.log(`Found ${matches.length} items where reading exists but sentence says 'not used'.`);
console.log(JSON.stringify(matches.map(d => ({ kanji: d.kanji, category: d.category, kun: d.kun_reading })), null, 2));

// Specifically check for 勍
const kyoh = data.find(k => k.kanji === '勍');
console.log('勍 data:', JSON.stringify(kyoh, null, 2));
