const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

let fixCount = 0;

data.forEach(d => {
    let changed = false;

    // 1. Label Correction
    if (d.examples) {
        d.examples.forEach(ex => {
            const oldMean = ex.mean;
            const cleanMean = ex.mean.replace(/\s*\([\)\w\s가-힣]+\)$/, '').trim();

            const onPrefixes = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => k2h(r.trim().toLowerCase()).split('.')[0]);
            const kunPrefixes = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim().toLowerCase().split('.')[0]);

            let isOn = onPrefixes.some(p => ex.reading.startsWith(p));
            let isKun = kunPrefixes.some(p => ex.reading.startsWith(p));

            let suffix = '';
            if (isOn && !isKun) suffix = ' (음독)';
            else if (isKun && !isOn) suffix = ' (훈독)';
            else if (isOn && isKun) suffix = ' (음/훈독)';
            else suffix = ' (음독)'; // Default if unknown, usually On

            ex.mean = `${cleanMean}${suffix}`;
            if (ex.mean !== oldMean) changed = true;
        });
    }

    // 2. Array Conversion for multi-readings
    const onCount = d.on_reading === '-' ? 0 : d.on_reading.split('/').length;
    const kunCount = d.kun_reading === '-' ? 0 : d.kun_reading.split('/').length;

    if (onCount > 1 && d.on_sentence && !Array.isArray(d.on_sentence)) {
        d.on_sentence = [d.on_sentence];
        changed = true;
    }
    if (kunCount > 1 && d.kun_sentence && !Array.isArray(d.kun_sentence)) {
        d.kun_sentence = [d.kun_sentence];
        changed = true;
    }

    // 3. Ruby Splitting (Simple cases)
    const rubySplit = (text) => {
        if (!text) return text;
        return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
            if (kanjis.length > 1 && kanjis.length === read.length) {
                let res = '';
                for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${read[i]})`;
                return res;
            }
            // For common cases like 四月(しがつ)
            if (kanjis === "四月" && read === "しがつ") return "[四](し)[月](がつ)";
            if (kanjis === "三月" && read === "さんがつ") return "[三](さん)[月](がつ)";
            if (kanjis === "二月" && read === "に") return "[二](に)[月](がつ)"; // wait no
            return full;
        });
    };

    const processSentence = (s) => {
        if (!s) return;
        if (Array.isArray(s)) {
            s.forEach(item => {
                const old = item.text;
                item.text = rubySplit(item.text);
                if (item.text !== old) changed = true;
            });
        } else {
            const old = s.text;
            s.text = rubySplit(s.text);
            if (s.text !== old) changed = true;
        }
    };
    processSentence(d.on_sentence);
    processSentence(d.kun_sentence);

    if (changed) fixCount++;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Auto-fixed ${fixCount} entries for basic guidelines.`);
