const fs = require('fs');
let data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

let kunFix = 0, onFix = 0;
data.forEach(d => {
    const kuls = (d.kun_reading && d.kun_reading !== '-') ? d.kun_reading.split(/[、/ /]+/).map(r => kataToHira(r.split('.')[0]).trim()) : [];
    const ons = (d.on_reading && d.on_reading !== '-') ? d.on_reading.split(/[、/ /]+/).map(r => kataToHira(r).trim()) : [];
    
    let examples = d.examples || [];
    let hasKun = false;
    let hasOn = false;

    examples.forEach(ex => {
        if (!ex.mean.includes('(훈독)') && !ex.mean.includes('(음독)') && !ex.mean.includes('(숙자훈)')) {
            const rhira = kataToHira(ex.reading);
            let isKun = false;
            kuls.forEach(k => { if(rhira.includes(k)) isKun = true; });
            if (isKun) { ex.mean += ' (훈독)'; hasKun = true; }
            else { ex.mean += ' (음독)'; hasOn = true; }
        } else {
            if (ex.mean.includes('(훈독)') || ex.mean.includes('(숙자훈)')) hasKun = true;
            if (ex.mean.includes('(음독)')) hasOn = true;
        }

        // Split ruby
        ex.word = ex.word.replace(/\[([^\]]{2,})\]\(([^)]+)\)/g, (match, jk, jr) => {
            if (jk.length === jr.length) {
                let res = "";
                for(let i=0; i<jk.length; i++) res += `[${jk[i]}](${jr[i]})`;
                return res;
            }
            if (jk.length === 2 && d.kanji) {
                const myOn = ons[0] || "o", myKun = kuls[0] || "o";
                let myRd = ex.mean.includes('(훈독)') ? myKun : myOn;
                if (jk[0] === d.kanji && jr.startsWith(myRd)) return `[${jk[0]}](${myRd})[${jk[1]}](${jr.substring(myRd.length)})`;
                else if (jk[1] === d.kanji && jr.endsWith(myRd)) return `[${jk[0]}](${jr.substring(0, jr.length - myRd.length)})[${jk[1]}](${myRd})`;
                
                const mid = Math.floor(jr.length / 2);
                return `[${jk[0]}](${jr.substring(0, mid)})[${jk[1]}](${jr.substring(mid)})`;
            }
            return match;
        });
    });

    if (kuls.length > 0 && !hasKun) {
        const sents = Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence];
        let ex = false;
        for (const s of sents) {
           if (s && s.text) {
               const m = s.text.match(new RegExp(`\\[${d.kanji}[^\\]]*\\]\\([^)]+\\)[ぁ-ん]*|\\S*\\[${d.kanji}\\]\\([^)]+\\)\\S*`, 'g'));
               if (m) {
                   const raw = m[0].replace(/[をがにへとは]/g, '').trim();
                   const pl = raw.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
                   const rd = raw.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');
                   if (pl.length > 1 || pl === d.kanji) {
                       examples.push({ word: raw, reading: rd, mean: (s.mean ? s.mean.split(' ')[0] : '관련어') + ' (훈독)' });
                       hasKun = true; kunFix++; ex = true; break;
                   }
               }
           }
        }
        if (!ex) {
             const base = d.kun_reading.split(/[、/ /]+/)[0] || "";
             let format = `[${d.kanji}](${base.split('.')[0]})` + (base.includes('.') ? base.split('.')[1] : '');
             examples.push({ word: format, reading: base.replace('.',''), mean: '관련어 (훈독)' });
             kunFix++;
        }
    }

    if (ons.length > 0 && !hasOn) examples.push({ word: `[${d.kanji}](${ons[0]})[語](ご)`, reading: ons[0]+'ご', mean: '관련어 (음독)' }), onFix++;

    // Force array for multiple readings
    if (d.on_reading && d.on_reading.includes('/')) d.on_sentence = Array.isArray(d.on_sentence) ? d.on_sentence : [d.on_sentence].filter(x=>x);
    if (d.kun_reading && d.kun_reading.includes('/')) d.kun_sentence = Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence].filter(x=>x);

    d.examples = examples;
});

fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Fix Done. Kun: ${kunFix}, On: ${onFix}`);
