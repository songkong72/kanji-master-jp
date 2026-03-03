const fs = require('fs');

const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let count = 0;
const validEndings = ['る', 'す', 'く', 'ぐ', 'む', 'ぶ', 'ぬ', 'う', 'つ', 'だ', 'た', 'い', 'す', 'ん', 'か', 'ね', 'よ', 'て', 'わ', 'な', 'お', 'え', 'ろ'];

d.forEach(k => {
    let modified = false;
    const processSents = (sents) => {
        if (!sents) return;
        if (!Array.isArray(sents)) sents = [sents];
        sents.forEach(s => {
            if (!s || !s.text || s.text === '-') return;

            let textNoRuby = s.text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
            textNoRuby = textNoRuby.replace(/[。,\.\s]/g, ''); // strip punctuation

            if (textNoRuby.length === 0) return;

            const lastChar = textNoRuby[textNoRuby.length - 1];

            // Clean up old script mess `.[Kanji].だ。`
            if (s.text.includes('.だ。')) {
                s.text = s.text.replace('.だ。', 'だ。');
                count++;
            }
            if (s.text.endsWith('てだ。')) {
                s.text = s.text.replace('てだ。', 'て。');
                s.mean = s.mean.replace('이다.', '.');
                count++;
            }
            if (s.mean.endsWith('등이다.')) {
                s.mean = s.mean.replace('등이다.', '등이다.');
            }

            const isKanji = /[一-龯]/.test(lastChar);
            const isInvalidKana = /[ぁ-んァ-ン]/.test(lastChar) && !validEndings.includes(lastChar);

            if ((isKanji || isInvalidKana || s.text.match(/^\[([^\]]+)\]\([^\)]+\)。?$/)) && !s.text.endsWith('だ。') && !s.text.endsWith('です。')) {
                // Append だ。
                if (!s.text.endsWith('。')) s.text += '。';
                s.text = s.text.replace(/。$/, 'だ。');

                if (s.mean.endsWith('등.')) {
                    s.mean = s.mean.replace(/\.$/, '이다.');
                } else if (s.mean.endsWith('.')) {
                    if (!s.mean.endsWith('다.')) {
                        s.mean = s.mean.replace(/\.$/, '이다.');
                    }
                } else if (!s.mean.endsWith('다')) {
                    s.mean += '이다.';
                }

                if (s.text.match(/^\[([^\]]+)\]\([^\)]+\)だ。$/)) {
                    s.text = 'これは' + s.text;
                    s.mean = '이것은 ' + s.mean;
                }

                modified = true;
                count++;
            }
        });
    };
    processSents(k.on_sentence);
    processSents(k.kun_sentence);
});

console.log('Fixed count:', count);
fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(d, null, 2));
