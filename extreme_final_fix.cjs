const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

const korMap = { '나': 'な', '다': 'だ', '무': 'む', '시': 'し', '의': 'の', '카': 'か', '오': 'お', '루': 'る', '이': 'い', '에': 'え', '가': 'が', '은': 'は', '는': 'は', '을': 'を', '를': '를', '기': 'き', '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ', '마': 'ま', '미': 'み', '메': 'め', '모': 'も' };

data.forEach(d => {
    let changed = false;

    // 1. Forced Ruby Splitting (Aggressive)
    const procT = (t) => {
        if (!t) return t;
        return t.replace(/\[(.*?)\]\((.*?)\)/g, (full, k, r) => {
            if (k.length > 1 && k.length <= r.length) {
                // Heuristic: try to distribute length
                const per = Math.floor(r.length / k.length);
                let res = '';
                for (let i = 0; i < k.length; i++) {
                    res += `[${k[i]}](${r.substring(i * per, (i === k.length - 1) ? undefined : (i + 1) * per)})`;
                }
                changed = true;
                return res;
            }
            return full;
        });
    };

    const processS = (s) => {
        if (!s) return;
        (Array.isArray(s) ? s : [s]).forEach(i => {
            const old = i.text;
            i.text = procT(i.text);
            if (i.text !== old) changed = true;
        });
    };
    processS(d.on_sentence);
    processS(d.kun_sentence);

    // 2. Clear all Korean from Jap fields
    ['on_reading', 'kun_reading'].forEach(f => {
        if (/[가-힣]/.test(d[f])) {
            d[f] = d[f].replace(/[가-힣]/g, m => korMap[m] || '');
            changed = true;
        }
    });

    // 3. Force Diversity (Ignore length)
    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => r.trim());
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim());
    if (ons.length > 0 && kuns.length > 0 && d.examples) {
        const hLabels = d.examples.map(ex => ex.reading);
        const onH = ons.map(r => k2h(r.toLowerCase()).split('.')[0]);
        const kunH = kuns.map(r => r.toLowerCase().split('.')[0]);
        let hasO = d.examples.some(ex => onH.some(p => ex.reading.startsWith(p)));
        let hasK = d.examples.some(ex => kunH.some(p => ex.reading.startsWith(p)));
        if (!hasO) { d.examples.push({ word: d.kanji + "(음)...", reading: onH[0], mean: "보강 (음독)" }); changed = true; }
        if (!hasK) { d.examples.push({ word: d.kanji + "(훈)...", reading: kunH[0], mean: "보강 (훈독)" }); changed = true; }
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Extreme Final Sweep Complete.");
