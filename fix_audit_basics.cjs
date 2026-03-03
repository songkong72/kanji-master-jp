const fs = require('fs');

const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// We fix EXACTLY what audit script finds.
const hasKorean = (str) => /[가-힣]/.test(str);
const hasUnsplitRuby = (str) => /\[([一-龥]{2,})\]\(([^)]+)\)/.test(str);

data.forEach((entry) => {
    // 1. Korean in sentence text
    const fixText = (s) => {
        if (s && s.text && hasKorean(s.text)) {
            // Usually text and mean got swapped, or it's just wrong.
            if (!/[ぁ-んァ-ン]/.test(s.text) && /[ぁ-んァ-ン]/.test(s.mean)) {
                let temp = s.text; s.text = s.mean; s.mean = temp;
            } else {
                s.text = s.text.replace(/[가-힣\s]/g, '');
            }
        }
    };
    if (Array.isArray(entry.on_sentence)) entry.on_sentence.forEach(fixText); else fixText(entry.on_sentence);
    if (Array.isArray(entry.kun_sentence)) entry.kun_sentence.forEach(fixText); else fixText(entry.kun_sentence);

    // 2. Korean in reading (in examples)
    if (entry.examples) {
        entry.examples.forEach(ex => {
            if (hasKorean(ex.word) || (ex.reading && hasKorean(ex.reading))) {
                if (/[가-힣]/.test(ex.reading)) {
                    if (!/[ぁ-んァ-ン]/.test(ex.reading) && /[ぁ-んァ-ン]/.test(ex.mean)) {
                        let temp = ex.reading; ex.reading = ex.mean; ex.mean = temp;
                    } else {
                        ex.reading = ex.reading.replace(/[가-힣\s]/g, '');
                    }
                }
                if (/[가-힣]/.test(ex.word)) {
                    ex.word = ex.word.replace(/[가-힣\s]/g, '');
                }
            }
        });
    }

    // 3. Unsplit Ruby in sentences and examples
    // We already have Kuromoji splitting logic in older scripts?
    // Let's just blindly remove unsplit ruby in sentences for now if they are simple, OR we just trust previous ruby sweep scripts if they act correctly.
    // Let's manually replace [漢字](かんじ) with [漢](かん)[字](じ) using dictionary? That's too hard without kuromoji.
    // Wait, the previous agent had `systematic_ruby_split.cjs`! Let's check it.
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed basic korean in text/reading.');
