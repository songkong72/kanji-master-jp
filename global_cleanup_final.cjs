const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

data.forEach(d => {
    let changed = false;

    // 1. Force array for multi-reading sentences
    if (d.on_reading.includes('/') && d.on_sentence && !Array.isArray(d.on_sentence)) {
        d.on_sentence = [d.on_sentence];
        changed = true;
    }
    if (d.kun_reading.includes('/') && d.kun_sentence && !Array.isArray(d.kun_sentence)) {
        d.kun_sentence = [d.kun_sentence];
        changed = true;
    }

    // 2. Clean up any remaining Korean particles in sentences
    const pMap = { '에': 'に', '가': 'が', '은': 'は', '는': 'は', '을': '를', '를': 'を', '이': 'い' };
    const cleanS = (s) => {
        if (!s) return;
        const proc = (i) => {
            const old = i.text;
            // Replace standalone Korean characters that look like particles
            i.text = i.text.replace(/([^\uAC00-\uD7AF\s])([가-힣])([\s\.!?,])/g, (f, b, k, a) => {
                return b + (pMap[k] || k) + a;
            });
            if (i.text !== old) changed = true;
        };
        if (Array.isArray(s)) s.forEach(proc);
        else proc(s);
    };
    cleanS(d.on_sentence);
    cleanS(d.kun_sentence);

    // 3. Label check
    if (d.examples) {
        d.examples.forEach(ex => {
            if (!ex.mean.includes('(')) {
                const onP = (d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => k2h(r.trim().toLowerCase()).split('.')[0]));
                const isO = onP.some(p => ex.reading.startsWith(p));
                ex.mean += isO ? ' (음독)' : ' (훈독)';
                changed = true;
            }
        });
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Global clean complete.");
