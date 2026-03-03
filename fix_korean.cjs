const fs = require('fs');

const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Re-check bad things and fix them.

// 1. Fix korean in reading
data.forEach(d => {
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading && /[가-힣]/.test(ex.reading)) {
                // usually the korean slipped into reading field
                // fallback
                if (!/[ぁ-んァ-ン]/.test(ex.reading) && /[ぁ-んァ-ン]/.test(ex.mean)) {
                    const temp = ex.reading;
                    ex.reading = ex.mean;
                    ex.mean = temp;
                } else {
                    ex.reading = ex.reading.replace(/[가-힣\s]/g, '');
                }
            }
        });
    }

    // 2. Fix korean in text
    const checkText = (s) => {
        if (s && s.text && /[가-힣]/.test(s.text)) {
            if (!/[ぁ-んァ-ン]/.test(s.text) && /[ぁ-んァ-ン]/.test(s.mean)) {
                const temp = s.text;
                s.text = s.mean;
                s.mean = temp;
            }
        }
    }

    if (Array.isArray(d.on_sentence)) d.on_sentence.forEach(checkText);
    else checkText(d.on_sentence);
    if (Array.isArray(d.kun_sentence)) d.kun_sentence.forEach(checkText);
    else checkText(d.kun_sentence);
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed Korean characters in readings/texts');
