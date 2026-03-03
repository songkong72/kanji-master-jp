const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let totalRemoved = 0;
let totalAdded = 0;

data.forEach(d => {
    let changed = false;

    // 1. Remove Duplicate Examples (One entry per pronunciation)
    if (d.examples) {
        const seen = new Set();
        const newExamples = [];
        d.examples.forEach(ex => {
            if (!seen.has(ex.reading)) {
                seen.add(ex.reading);
                newExamples.push(ex);
            } else {
                totalRemoved++;
                changed = true;
            }
        });
        d.examples = newExamples;
    }

    // 2. Fix the 6 Missing Sentence cases manually
    const fixS = (id, field, texts) => {
        if (d.id === id) {
            d[field] = texts;
            changed = true;
            totalAdded++;
        }
    };

    // 集 (196) - 훈독 아츠메루/아츠마루
    fixS(196, 'kun_sentence', [
        { "text": "[切](き)手を[集](あつ)める。", "mean": "우표를 모으다." },
        { "text": "[人](ひと)가 [集](あつ)まる。", "mean": "사람이 모이다." } // Fix '가' later
    ]);

    // 負 (415) - 마케루/마카스/오우
    fixS(415, 'kun_sentence', [
        { "text": "[試](し)[合](あい)に[負](ま)ける。", "mean": "시합에 지다." },
        { "text": "[相](あい)[手](て)を[負](ま)かす。", "mean": "상대를 패배시키다." },
        { "text": "[責](せ[任](にん)を[負](お)う。", "mean": "책임을 지다." }
    ]);

    // 従 (454) - 시타가우/시타가에루
    fixS(454, 'kun_sentence', [
        { "text": "[指](し)[示](じ)に[従](したが)う。", "mean": "지시에 따르다." },
        { "text": "[家](か)[臣](しん)를 [従](したが)える。", "mean": "가신을 거느리다." }
    ]);

    // Global cleanup for any remaining '에/가' particles outside ruby in these fixed sentences
    const cleanFinal = (s) => {
        if (!s) return;
        (Array.isArray(s) ? s : [s]).forEach(i => {
            i.text = i.text.replace(/([\)\]])에/g, '$1に').replace(/([\)\]])가/g, '$1が').replace(/([\)\]])를/g, '$1를');
        });
    };
    cleanFinal(d.on_sentence);
    cleanFinal(d.kun_sentence);
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Deduplication complete. Removed ${totalRemoved} duplicates and fixed ${totalAdded} core deficiencies.`);
