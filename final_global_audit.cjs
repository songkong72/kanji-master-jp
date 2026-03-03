const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

const summary = {
    total: data.length,
    byCategory: {},
    issues: {
        missingSentences: 0,
        missingDiversity: 0,
        unsplitRuby: 0,
        koreanInField: 0
    }
};

data.forEach(d => {
    summary.byCategory[d.category] = (summary.byCategory[d.category] || 0) + 1;

    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => r.trim());
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim());
    const totalReadings = ons.length + kuns.length;

    const onS = Array.isArray(d.on_sentence) ? d.on_sentence : (d.on_sentence ? [d.on_sentence] : []);
    const kunS = Array.isArray(d.kun_sentence) ? d.kun_sentence : (d.kun_sentence ? [d.kun_sentence] : []);
    const totalSentences = onS.length + kunS.length;

    // Issue 1: Missing sentences for alternative readings
    if (ons.length > onS.length || kuns.length > kunS.length) {
        summary.issues.missingSentences++;
    }

    // Issue 2: Lack of diversity in example words
    if (ons.length > 0 && kuns.length > 0 && d.examples) {
        const onH = ons.map(r => k2h(r.toLowerCase()).split('.')[0]);
        const kunH = kuns.map(r => r.toLowerCase().split('.')[0]);
        let hasO = d.examples.some(ex => onH.some(p => ex.reading.startsWith(p)));
        let hasK = d.examples.some(ex => kunH.some(p => ex.reading.startsWith(p)));
        if (!hasO || !hasK) summary.issues.missingDiversity++;
    }

    // Issue 3: Unsplit ruby
    const checkText = (t) => {
        if (!t) return;
        const matches = t.match(/\[(.*?)\]\((.*?)\)/g);
        if (matches) {
            matches.forEach(m => {
                const kanji = m.match(/\[(.*?)\]/)[1];
                if (kanji.length > 1) summary.issues.unsplitRuby++;
            });
        }
    };
    [...onS, ...kunS].forEach(s => checkText(s.text));

    // Issue 4: Korean in forbidden fields
    const hasKor = (t) => t && /[가-힣]/.test(t);
    if (hasKor(d.on_reading) || hasKor(d.kun_reading)) summary.issues.koreanInField++;
});

console.log(JSON.stringify(summary, null, 2));
