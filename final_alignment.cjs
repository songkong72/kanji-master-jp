const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const fixList = ["冴", "袴", "襟", "袂", "袷", "唄", "茨", "茲", "苺", "菱", "茄"];

data.forEach(d => {
    if (fixList.includes(d.kanji)) {
        // If it has an ON reading but says "usually not used", just set reading to - to avoid confusion
        // unless it's a standard one. But these are rare ones.
        if (d.on_sentence?.text?.includes('通常') && d.on_sentence?.text?.includes('音読')) {
            d.on_reading = "-";
        }
        // For kun, they ALREADY have real sentences from my previous fixes.
        // Let's re-verify they ARE real.
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Fixed readings mapping for remaining items.');
