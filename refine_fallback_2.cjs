const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let c = 0;
data.forEach(d => {
    let check = arr => {
        if (!arr) return;
        arr.forEach(s => {
            if (s === null || typeof s === 'undefined') return;
            if (s.text && s.text.includes('これは') && s.text.endsWith('だ。') && s.mean && s.mean.includes('단어')) {
                let wMatch = s.text.match(/これは(.+)だ。/);
                if (wMatch) {
                    let w = wMatch[1];
                    const plain = w.replace(/\[([^\]]+)\]\([^)]+\)/g, '');
                    if (plain.length > 0 && "うくすつぬふむる".includes(plain.slice(-1))) {
                        s.text = `よく${w}。`;
                    } else {
                        s.text = `新(あたら)しい${w}。`;
                    }
                    s.mean = '의미 생략';
                    c++;
                }
            } else if (s.text && s.text.includes('これは') && s.text.endsWith('だ。')) {
                let wMatch = s.text.match(/これは(.+)だ。/);
                if (wMatch) {
                    let w = wMatch[1];
                    const plain = w.replace(/\[([^\]]+)\]\([^)]+\)/g, '');
                    if (plain.length > 0 && "うくすつぬふむる".includes(plain.slice(-1))) {
                        s.text = `よく${w}。`;
                        if (s.mean) s.mean = s.mean.replace('이것은 ', '자주 ').replace('이다.', '.');
                        c++;
                    }
                }
            }
        });
    };
    check(Array.isArray(d.on_sentence) ? d.on_sentence : [d.on_sentence]);
    check(Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence]);
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed crude fallback templates:', c);
