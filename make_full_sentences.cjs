const fs = require('fs');

const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let count = 0;
const validEndings = ['る', 'す', 'く', 'ぐ', 'む', 'ぶ', 'ぬ', 'う', 'つ', 'だ', 'た', 'い', 'す', 'ん', 'か', 'ね', 'よ'];

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

            // If the last character is a Kanji, or it's a Kana but NOT in valid sentence endings
            // It's likely a noun phrase.
            const isKanji = /[一-龯]/.test(lastChar);
            const isInvalidKana = /[ぁ-んァ-ン]/.test(lastChar) && !validEndings.includes(lastChar);

            if (isKanji || isInvalidKana || s.text.match(/^\[([^\]]+)\]\([^\)]+\)。?$/)) {
                // Append だ。
                if (!s.text.endsWith('。')) s.text += '。';
                s.text = s.text.replace(/。$/, 'だ。');

                if (s.mean.endsWith('등.')) {
                    //
                } else if (s.mean.endsWith('.')) {
                    if (!s.mean.endsWith('다.')) {
                        s.mean = s.mean.replace(/\.$/, '이다.');
                    }
                } else if (!s.mean.endsWith('다')) {
                    s.mean += '이다.';
                }

                // Let's add これは if it's super short
                if (s.text.match(/^\[([^\]]+)\]\([^\)]+\)だ。$/)) {
                    s.text = 'これは' + s.text;
                    s.mean = '이것은 ' + s.mean;
                }

                modified = true;
                count++;
                console.log(s.text, ' -> ', s.mean);
            }
        });
    };
    processSents(k.on_sentence);
    processSents(k.kun_sentence);
});

console.log('Fixed count:', count);
fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(d, null, 2));
