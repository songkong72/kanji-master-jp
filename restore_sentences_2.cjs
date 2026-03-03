const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// We will collect candidates
let candidates = {};
data.forEach(d => {
    candidates[d.kanji] = { on: [], kun: [] };
});

const scripts = fs.readdirSync('.').filter(f => f.startsWith('update_n') && f.endsWith('.cjs'));
scripts.forEach(script => {
    try {
        const text = fs.readFileSync(script, 'utf8');
        const match = text.match(/const updates = ({[\s\S]*?});\s*(const|let|data)/);
        if (match) {
            const updates = eval('(' + match[1] + ')');
            for (let kj in updates) {
                if (!candidates[kj]) continue;
                if (updates[kj].on_sentence) {
                    if (Array.isArray(updates[kj].on_sentence)) updates[kj].on_sentence.forEach(s => candidates[kj].on.push(s));
                    else candidates[kj].on.push(updates[kj].on_sentence);
                }
                if (updates[kj].kun_sentence) {
                    if (Array.isArray(updates[kj].kun_sentence)) updates[kj].kun_sentence.forEach(s => candidates[kj].kun.push(s));
                    else candidates[kj].kun.push(updates[kj].kun_sentence);
                }
            }
        }
    } catch (e) { }
});

function isValid(s) {
    if (!s || !s.text || s.text === '-') return false;
    let t = s.text.replace(/[가-힣]/g, '').trim();
    if (t.length < 5) return false;
    if (t.includes('()')) return false;
    if (t.match(/^\[.\]\([^)]*\)。$/)) return false;
    return true;
}

let cFixed = 0;
data.forEach(d => {
    let currentOnBroken = false;
    if (Array.isArray(d.on_sentence)) { if (!d.on_sentence.some(isValid)) currentOnBroken = true; }
    else { if (!isValid(d.on_sentence)) currentOnBroken = true; }

    let currentKunBroken = false;
    if (Array.isArray(d.kun_sentence)) { if (!d.kun_sentence.some(isValid)) currentKunBroken = true; }
    else { if (!isValid(d.kun_sentence)) currentKunBroken = true; }

    if (currentOnBroken && candidates[d.kanji].on.length > 0) {
        let best = candidates[d.kanji].on.filter(isValid).sort((a, b) => b.text.length - a.text.length)[0];
        if (best) {
            d.on_sentence = { text: best.text.replace(/[가-힣]/g, '').trim(), mean: best.mean };
            cFixed++;
        }
    }

    if (currentKunBroken && candidates[d.kanji].kun.length > 0) {
        let best = candidates[d.kanji].kun.filter(isValid).sort((a, b) => b.text.length - a.text.length)[0];
        if (best) {
            d.kun_sentence = { text: best.text.replace(/[가-힣]/g, '').trim(), mean: best.mean };
            cFixed++;
        }
    }

    // Still broken? Fallback
    if (currentOnBroken) {
        if (!Array.isArray(d.on_sentence)) d.on_sentence = [d.on_sentence];
        if (!d.on_sentence.some(isValid) && d.on_reading && d.on_reading !== '-') {
            d.on_sentence = [{ text: `[${d.kanji}](${d.on_reading.split(/[、/ /]+/)[0] || 'o'})の[練習](れんしゅう)。`, mean: "음독 연습." }];
        }
    }

    if (currentKunBroken) {
        if (!Array.isArray(d.kun_sentence)) d.kun_sentence = [d.kun_sentence];
        if (!d.kun_sentence.some(isValid) && d.kun_reading && d.kun_reading !== '-') {
            const base = d.kun_reading.split(/[、/ /]+/)[0].replace('.', '');
            d.kun_sentence = [{ text: `[${d.kanji}](${base})を[覚](おぼ)える。`, mean: "모양을 외우다." }];
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed sentences count:', cFixed);
