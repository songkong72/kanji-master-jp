const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// We want to fix crude generations like `これはXXXだ。` if XXX is a verb (ends in u).
// Also `これはXXXだ。` if mean was `단어`.

function isVerbWord(word) {
    // very basic heuristic: if it contains kana and ends with u, ku, su, tsu, nu, hu, mu, ru
    // In our bracket format: [漢字](かんじ)る -> the plain part outside bracket
    const plain = word.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '');
    if (plain.length > 0 && "うくすつぬふむる".includes(plain.slice(-1))) return true;
    return false;
}

let c = 0;
data.forEach(d => {
    let check = arr => {
        if (!arr) return;
        arr.forEach(s => {
            if (s.text && s.text.includes('これは') && s.text.endsWith('だ。') && s.mean.includes('단어')) {
                // Crude fallback detected
                // Let's extract the word
                let wMatch = s.text.match(/これは(.+)だ。/);
                if (wMatch) {
                    let w = wMatch[1];
                    if (isVerbWord(w)) {
                        s.text = `よく${w}。`;
                        s.mean = `자주 단어.`; // still mean is bad, let's fix mean if possible
                    } else {
                        // Noun
                        s.text = `新(あたら)しい${w}。`;
                        s.mean = `새로운 단어.`;
                    }
                    c++;
                }
            } else if (s.text && s.text.includes('これは') && s.text.endsWith('だ。')) {
                let wMatch = s.text.match(/これは(.+)だ。/);
                if (wMatch) {
                    let w = wMatch[1];
                    if (isVerbWord(w)) {
                        s.text = `よく${w}。`;
                        s.mean = s.mean.replace('이것은 ', '자주 ').replace('이다.', '.');
                        c++;
                    }
                }
            }
        });
    };
    check(d.on_sentence);
    check(d.kun_sentence);

    // Fix the mean='단어' string which is ugly.
    let fixMean = arr => {
        if (!arr) return;
        arr.forEach(s => {
            if (s.mean === '이것은 단어이다.' || s.mean === '새로운 단어.' || s.mean === '자주 단어.') {
                // Try to get actual meaning
                let wMatch = s.text.match(/よく(.+?)。/) || s.text.match(/新\(あたら\)しい(.+?)。/) || s.text.match(/これは(.+?)だ。/);
                if (wMatch) {
                    let w = wMatch[1];
                    // lookup in examples
                    let ex = d.examples.find(e => e.word === w);
                    if (ex) {
                        let realMean = ex.mean.split(' ')[0];
                        if (s.text.startsWith('よく')) s.mean = `자주 ${realMean}.`;
                        else if (s.text.startsWith('新')) s.mean = `새로운 ${realMean}.`;
                        else s.mean = `이것은 ${realMean}이다.`;
                    } else {
                        // if no ex, word might be the fallback formatting `[漢字](hira)...`
                        s.mean = "의미 생략";
                    }
                }
            }
        });
    };
    fixMean(d.on_sentence);
    fixMean(d.kun_sentence);
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed crude fallback templates: ', c);
