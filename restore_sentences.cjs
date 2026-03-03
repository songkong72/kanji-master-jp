const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. Collect all candidates for each Kanji
const candidates = {};
data.forEach(d => {
    candidates[d.kanji] = { on: [], kun: [], examples: [] };
});

const files = fs.readdirSync('.').filter(f => f.endsWith('.cjs') || f.endsWith('.js') || f.endsWith('.json'));

files.forEach(f => {
    try {
        const text = fs.readFileSync(f, 'utf8');
        // Look for typical structures: "on_sentence": { "text": "...", "mean": "..." }
        // We can just regex for: "text":\s*"([^"]+)",\s*"mean":\s*"([^"]+)"
        // But to associate it with a kanji is hard if we just regex.
        // Wait, for JSON files, we can just JSON.parse
        if (f.endsWith('.json') && !f.includes('package')) {
            const arr = JSON.parse(text);
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    if (item && item.kanji && candidates[item.kanji]) {
                        if (item.on_sentence) {
                            const arr = Array.isArray(item.on_sentence) ? item.on_sentence : [item.on_sentence];
                            arr.forEach(s => candidates[item.kanji].on.push(s));
                        }
                        if (item.kun_sentence) {
                            const arr = Array.isArray(item.kun_sentence) ? item.kun_sentence : [item.kun_sentence];
                            arr.forEach(s => candidates[item.kanji].kun.push(s));
                        }
                    }
                });
            }
        } else {
            // For .cjs/.js files, we'll try to find objects that have kanji, on_sentence, kun_sentence.
            // Many are in formats like: "Kanji": { "on_sentence": {...} }
            // Let's use a regex to capture them.
            const regex = /"([^"]{1})"\s*:\s*\{\s*"on_sentence"\s*:\s*(\{(?:.|\s)*?\})\s*,\s*"kun_sentence"\s*:\s*(\{(?:.|\s)*?\})\s*\}/g;
            let m;
            while ((m = regex.exec(text)) !== null) {
                const kj = m[1];
                if (candidates[kj]) {
                    try {
                        let onS = eval('(' + m[2] + ')');
                        let kunS = eval('(' + m[3] + ')');
                        candidates[kj].on.push(onS);
                        candidates[kj].kun.push(kunS);
                    } catch (e) { }
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

let fixed = 0;
data.forEach(d => {
    // Check if current is broken
    let currentOnBroken = false;
    if (Array.isArray(d.on_sentence)) {
        if (!d.on_sentence.some(isValid)) currentOnBroken = true;
    } else {
        if (!isValid(d.on_sentence)) currentOnBroken = true;
    }

    let currentKunBroken = false;
    if (Array.isArray(d.kun_sentence)) {
        if (!d.kun_sentence.some(isValid)) currentKunBroken = true;
    } else {
        if (!isValid(d.kun_sentence)) currentKunBroken = true;
    }

    if (currentOnBroken) {
        // Find best candidate
        let best = candidates[d.kanji].on.filter(isValid).sort((a, b) => b.text.length - a.text.length)[0];
        if (best) {
            d.on_sentence = { text: best.text.replace(/[가-힣]/g, '').trim(), mean: best.mean };
            fixed++;
        }
    }

    if (currentKunBroken) {
        let best = candidates[d.kanji].kun.filter(isValid).sort((a, b) => b.text.length - a.text.length)[0];
        if (best) {
            d.kun_sentence = { text: best.text.replace(/[가-힣]/g, '').trim(), mean: best.mean };
            fixed++;
        }
    }

    // Still broken? Fallback strategy for On
    if (d.on_reading && d.on_reading !== '-') {
        if (!Array.isArray(d.on_sentence)) d.on_sentence = [d.on_sentence];
        if (!d.on_sentence.some(isValid)) {
            d.on_sentence = [{
                text: `[${d.kanji}](${d.on_reading.split(/[、/ /]+/)[0] || 'o'})の[練習](れんしゅう)です。`,
                mean: "음독 연습입니다."
            }];
        }
    }

    // Fallback strategy for Kun
    if (d.kun_reading && d.kun_reading !== '-') {
        if (!Array.isArray(d.kun_sentence)) d.kun_sentence = [d.kun_sentence];
        if (!d.kun_sentence.some(isValid)) {
            const base = d.kun_reading.split(/[、/ /]+/)[0].replace('.', '');
            d.kun_sentence = [{
                text: `[${d.kanji}](${base})のかたちを[覚](おぼ)える。`,
                mean: "모양을 외우다."
            }];
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Total fixed using candidates/fallbacks:', fixed);
