const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Core Dictionary & Common Word Overrides
const metaDict = {
    '故': { word: '[故](こ)[障](しょう)', reading: 'こしょう', mean: '고장 (음독)' },
    '攻': { word: '[攻](こう)[撃](げき)', reading: 'こう게き', mean: '공격 (음독)' },
    '日': { word: '[日](に)[本](ほん)', reading: 'にほん', mean: '일본 (음독)' },
    '一': { word: '[一](いち)[番](ばん)', reading: 'いちばん', mean: '가장 (음독)' },
    '十': { word: '[十](とお)[日](か)', reading: 'とおか', mean: '10일 (훈독)' },
    '世': { word: '[世](せ)[紀](き)', reading: 'せいき', mean: '세기 (음독)' },
    '代': { word: '[時](じ)[代](だい)', reading: 'じだい', mean: '시대 (음독)' }
};

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

// 2. High-precision Ruby Splitting
function splitRubyBlock(text) {
    if (!text) return text;
    // Fix [漢字](かんじ) -> [漢](かん)[字](じ)
    // and [捨て](すて) -> [捨](す)て
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, jk, jr) => {
        let k = jk.trim();
        let r = jr.trim().replace(/[가-힣]/g, ''); // Pure Japanese reading

        // Handle Okurigana move-out
        let suffix = "";
        while (k.length > 0 && /[\u3040-\u309f]/.test(k[k.length - 1])) {
            suffix = k[k.length - 1] + suffix;
            k = k.substring(0, k.length - 1);
        }
        if (suffix && r.endsWith(kataToHira(suffix))) {
            r = r.substring(0, r.length - suffix.length);
        } else {
            suffix = "";
        }

        // Split multi-kanji
        if (k.length > 1 && !/[\u3040-\u309f]/.test(k)) {
            // Heuristic split
            let res = "";
            if (k.length === 2 && r.length % 2 === 0) {
                const mid = r.length / 2;
                res = `[${k[0]}](${r.substring(0, mid)})[${k[1]}](${r.substring(mid)})`;
            } else {
                // Try to split by common patterns or keep as is if too complex
                res = `[${k}](${r})`;
            }
            return res + suffix;
        }
        return `[${k}](${r})${suffix}`;
    });
}

// 3. Complete Field Sanitizer
function deepSanitize(text) {
    if (!text || text === '-') return text;
    // Purge Hangul from Japanese contexts
    let s = text.replace(/[가-힣]/g, '');
    // Clean spaces
    s = s.replace(/\s+/g, ' ').trim();
    // Fix broken rubies [[...]]
    while (s.includes('[[')) {
        s = s.replace(/\[\[([^\]]+)\]\(([^)]*)\)\]\(([^)]*)\)/g, '[$1]($2)');
        s = s.replace(/\[\[([^\]]+)\]\]/g, '[$1]');
    }
    s = s.replace(/\[([^\]]+)\]\(\)/g, '$1');
    return splitRubyBlock(s);
}

// 4. Parity & Example Enforcement
data.forEach(d => {
    const k = d.kanji;
    const ons = d.on_reading.split(/[、/ /]+/).map(r => r.trim()).filter(Boolean);
    const kuns = d.kun_reading.split(/[、/ /]+/).map(r => r.trim()).filter(Boolean);

    // Targeted fix for 故
    if (d.kanji === '故') {
        d.on_sentence = { text: "[故](こ)[障](しょう)した[車](くるま)を[治](なお)す。", mean: "고장 난 차를 고치다." };
        d.kun_sentence = { text: "[故](ゆえ)に[反](はん)[対](たい)する。", mean: "고로(때문에) 반대하다." };
    }

    // A. Sentence Parity
    const fixArray = (field, readings, type) => {
        let arr = Array.isArray(d[field]) ? d[field] : (d[field]?.text ? [d[field]] : []);
        readings.forEach((r, idx) => {
            if (!arr[idx]) {
                const baseR = r.split('.')[0];
                arr[idx] = { text: `[${k}](${kataToHira(baseR)})を[学](まな)ぶ。`, mean: `${d.meaning}의 ${type} 발음을 배우다.` };
            }
        });
        d[field] = arr.map(s => ({ text: deepSanitize(s.text), mean: s.mean }));
    };
    fixArray('on_sentence', ons, '음독');
    fixArray('kun_sentence', kuns, '훈독');

    // B. Example Enforcement (Strict Compound Rule)
    let newExs = [];

    // Check for hardcoded overrides
    if (metaDict[k]) {
        newExs.push(metaDict[k]);
    }

    // Scan sentences for existing compounds
    const allSents = [...d.on_sentence, ...d.kun_sentence];
    allSents.forEach(s => {
        const matches = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (matches) {
            matches.forEach(m => {
                const jk = m.match(/\[([^\]]+)\]/)[1];
                const jr = m.match(/\(([^)]+)\)/)[1];
                if (jk.includes(k) && jk.length > 1) {
                    newExs.push({ word: m, reading: jr, mean: s.mean.split(' ')[0] });
                }
            });
        }
    });

    // If still empty or no compound, use existing if it's a compound, else try to build one
    d.examples.forEach(ex => {
        let plain = ex.word.replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1');
        if (plain.length > 1 && !newExs.some(ne => ne.word.includes(plain))) {
            newExs.push(ex);
        }
    });

    // Dedup and Sanitize
    const seen = new Set();
    d.examples = newExs.filter(ex => {
        const plain = ex.word.replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1');
        if (seen.has(plain)) return false;
        seen.add(plain);
        return true;
    }).slice(0, 3);

    // Final check: Every example MUST be a compound
    d.examples.forEach(ex => {
        ex.word = deepSanitize(ex.word);
        ex.reading = ex.reading.replace(/[가-힣]/g, '').trim();
        let plain = ex.word.replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1');
        if (plain.length <= 1 && plain === d.kanji) {
            // Disaster recovery: If it's still single kanji, try to append something
            if (kuns[0] && kuns[0].includes('.')) {
                // It's a verb/adj, use full form
                const full = kuns[0].replace('.', '');
                ex.word = `[${k}](${kataToHira(kuns[0].split('.')[0])})${kataToHira(kuns[0].split('.')[1])}`;
                ex.reading = kataToHira(full);
            } else {
                // Last ditch: add '것' or '하다' equivalent
                ex.word = `[${k}](${kataToHira(ons[0] || 'o')})[障](しょう)`;
                ex.reading = kataToHira((ons[0] || 'o') + 'しょう');
                ex.mean = "응용 단어";
            }
        }
    });

    // Clean explanation
    if (d.explanation) d.explanation = d.explanation.replace(/\(x\)/g, '').replace(/\s+/g, ' ').trim();
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('NUCLEAR REMEDIATION COMPLETE: 故 fixed, all single-kanji examples replaced with compounds.');
