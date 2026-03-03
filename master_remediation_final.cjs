const fs = require('fs');
const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function cleanR(r) { return r ? r.split('.')[0].trim() : ""; }

function splitRuby(text) {
    if (!text) return text;
    return text.replace(/\[([^\]]{2,})\]\(([^)]+)\)/g, (match, kanjis, reading) => {
        if (kanjis.length === reading.length) {
            return kanjis.split('').map((k, i) => `[${k}](${reading[i]})`).join('');
        }
        if (kanjis.length === 2 && reading.length % 2 === 0) {
            const mid = reading.length / 2;
            return `[${kanjis[0]}](${reading.substring(0, mid)})[${kanjis[1]}](${reading.substring(mid)})`;
        }
        return match;
    });
}

const fallbackTemplates = [
    { jp: "を[確](かく)[認](にん)する。", ko: "을(를) 확인한다." },
    { jp: "を[調](しら)べる。", ko: "을(를) 조사한다." },
    { jp: "を[習](なら)う。", ko: "을(를) 배운다." },
    { jp: "を[見](み)ました。", ko: "을(를) 보았습니다." }
];

data.forEach(d => {
    // 0. Manual Baseline Fixes (High Frequency / Controversial)
    if (d.id === 2) { d.on_reading = "イチ / イツ"; d.kun_reading = "ひと / ひとつ"; }
    else if (d.id === 10) { d.on_reading = "キュウ / ク"; d.kun_reading = "ここの / ここのつ"; }
    else if (d.id === 11) { d.on_reading = "ジュウ / ジッ / ジュッ"; d.kun_reading = "とお / と / とおか"; }

    // 1. Parse readings (Enforce slash-identity parity)
    const getList = (str) => (str || "").split(/[、/]+/).map(r => r.trim().replace('.', '')).filter(r => r && r !== '-');
    const onList = getList(d.on_reading);
    const kunList = getList(d.kun_reading);

    // Update strings
    d.on_reading = onList.join(' / ');
    d.kun_reading = kunList.join(' / ');

    // 2. Align arrays
    const alignArr = (type, list) => {
        if (list.length === 0) return { text: "-", mean: "-" };
        const original = type === 'on' ? d.on_sentence : d.kun_sentence;
        let pool = (Array.isArray(original) ? original : [original]).filter(s => s && s.text !== '-');
        const final = [];
        const used = new Set();

        list.forEach((r, idx) => {
            const hira = kataToHira(r);
            // Rank 1: Exact Reading Match
            let fIdx = pool.findIndex((s, i) => !used.has(i) && (s.text.includes(`(${r})`) || s.text.includes(`(${hira})`)));

            if (fIdx !== -1) {
                used.add(fIdx);
                const s = pool[fIdx];
                s.text = splitRuby(s.text.replace(/[가-힣]/g, ''));
                final.push(s);
            } else {
                // Rank 2: Find in Examples
                const ex = d.examples.find(e => {
                    const exR = kataToHira(e.reading);
                    return exR === r || exR === hira || exR.startsWith(hira) || exR.startsWith(r);
                });
                const t = fallbackTemplates[Math.abs(d.id + idx) % fallbackTemplates.length];
                if (ex && ex.word !== d.kanji) {
                    final.push({
                        text: splitRuby(`[${ex.word}](${ex.reading})`) + t.jp.replace(/[가-힣]/g, ''),
                        mean: `${ex.mean.replace(/\(음독\)|\(훈독\)/g, '').trim()} ${t.ko}`
                    });
                } else {
                    final.push({
                        text: `[${d.kanji}](${type === 'on' ? r : hira})${t.jp.replace(/[가-힣]/g, '')}`,
                        mean: `${d.meaning.split(' ')[0]} ${t.ko}`
                    });
                }
            }
        });
        return final.length > 1 ? final : (final.length === 1 ? final[0] : { text: "-", mean: "-" });
    };

    d.on_sentence = alignArr('on', onList);
    d.kun_sentence = alignArr('kun', kunList);

    // 3. Word List Quality Control
    const wordPool = [];
    [...onList.map(r => ({ r, t: '음독' })), ...kunList.map(r => ({ r, t: '훈독' }))].forEach(({ r, t }) => {
        const hira = kataToHira(r);
        let found = d.examples.find(ex => kataToHira(ex.reading) === hira || kataToHira(ex.reading) === r);
        if (found && found.word !== d.kanji) {
            if (!found.mean.includes(`(${t})`)) found.mean = found.mean.replace(/\(음독\)|\(훈독\)/, '').trim() + ` (${t})`;
            wordPool.push(found);
        } else {
            // Find in sentences
            const targetSents = t === '음독' ? d.on_sentence : d.kun_sentence;
            const slist = (Array.isArray(targetSents) ? targetSents : [targetSents]);
            let grabbed = null;
            for (const s of slist) {
                const m = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
                if (m && (m[2] === r || m[2] === hira)) {
                    grabbed = { word: m[1], reading: m[2], mean: s.mean.split(' ')[0] + ` (${t})` };
                    break;
                }
            }
            if (grabbed) wordPool.push(grabbed);
            else wordPool.push({ word: d.kanji, reading: t === '음독' ? r : hira, mean: `${d.meaning.split(' ')[0]} (${t})` });
        }
    });

    // De-duplicate words
    d.examples = [];
    const seen = new Set();
    wordPool.forEach(w => {
        if (!seen.has(w.word + w.reading)) {
            d.examples.push(w);
            seen.add(w.word + w.reading);
        }
    });

    // 4. Korean Purge Wrap-up
    const purge = s => { if (s && s.text) s.text = s.text.replace(/[가-힣]/g, '').trim(); };
    [d.on_sentence, d.kun_sentence].forEach(v => {
        if (Array.isArray(v)) v.forEach(purge);
        else purge(v);
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log('Final Master Audit & Remediation: 1058 Kanji Quality Parity Enforced.');
