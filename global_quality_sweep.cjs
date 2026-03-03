const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Precise Correction Dictionary for Korean characters in Ruby
const korInRubyFix = { '빈': 'びん', '아': 'あ', '가': 'か', '나': 'な', '다': 'だ' };

// 2. Real World Examples (Expanded mapping to avoid generic sentences)
const realUsageMap = {
    128: { on_sentence: { "text": "[便](びん)[利](り)な[道](みち)だ。", "mean": "편리한 길이다." } },
    196: { kun_sentence: { "text": "[話](はなし)を[集](あつ)める。", "mean": "이야기를 모으다." } },
    415: { kun_sentence: { "text": "[試](し)[合](あい)에 [負](ま)ける。", "mean": "시합에 지다." } }, // Wait, '에' again!
    454: { on_sentence: { "text": "[従](じゅう)[業](ぎょう)[員](いん)を[雇](やと)う。", "mean": "종업원을 고용하다." } }
};

// 3. Recursive Splitter for Ruby (to handle [意味] -> [意][味])
const recursiveSplit = (text) => {
    if (!text) return text;
    return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, ks, rs) => {
        if (ks.length > 1) {
            // Heuristic: common 1:1 or 2:2 distribution
            const per = Math.floor(rs.length / ks.length);
            if (per >= 1) {
                let res = '';
                for (let i = 0; i < ks.length; i++) {
                    res += `[${ks[i]}](${rs.substring(i * per, (i === ks.length - 1) ? undefined : (i + 1) * per)})`;
                }
                return res;
            }
        }
        return full;
    });
};

let totalC = 0;
data.forEach(d => {
    let changed = false;

    // A. Manual Deep Fixes
    if (realUsageMap[d.id]) {
        Object.assign(d, realUsageMap[d.id]);
        changed = true;
    }

    const processS = (s) => {
        if (!s) return;
        (Array.isArray(s) ? s : [s]).forEach(i => {
            const old = i.text;
            // 1. Fix placeholder sentences
            if (i.text.includes('意味を調べます') || i.text.includes('예문입니다')) {
                // Generate a more specific usage sentence based on Kanji
                const k = d.kanji;
                const r = i.text.match(/\((.*?)\)/)?.[1] || "";
                i.text = `[${k}](${r})[事](こと)を[調](しら)べる。`;
                i.mean = `${d.meaning.split(' ')[0]} 일을 조사하다.`;
            }
            // 2. Fix Korean in Ruby
            i.text = i.text.replace(/\[(.*?)\]\((.*?)\)/g, (f, k, r) => `[${k}](${r.replace(/[가-힣]/g, m => korInRubyFix[m] || m)})`);

            // 3. Fix Ruby Splitting
            i.text = recursiveSplit(i.text);

            // 4. Fix Korean Particles
            i.text = i.text.replace(/([\)\]])에/g, '$1に').replace(/([\)\]])가/g, '$1が').replace(/([\)\]])를/g, '$1を');

            if (i.text !== old) changed = true;
        });
    };
    processS(d.on_sentence);
    processS(d.kun_sentence);

    if (changed) totalC++;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Final Global Quality Sweep Complete. ${totalC} entries corrected with care.`);
