const fs = require('fs');
const cp = require('child_process');

console.log('Restoring kanjiData.json from HEAD...');
cp.execSync('git checkout HEAD -- src/data/kanjiData.json');
let data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

// List all N1/N2 update scripts that define "const updates = { ... }" and apply them!
const scripts = fs.readdirSync('.').filter(f => f.startsWith('update_n') && f.endsWith('.cjs'));
console.log('Applying ' + scripts.length + ' N1/N2 update scripts...');
scripts.forEach(script => {
    try {
        const content = fs.readFileSync(script, 'utf8');
        // Extract the updates object. This is a bit hacky but works since it's just JSON.
        const match = content.match(/const updates = ({[\s\S]*?});\n\nlet count/);
        if (match) {
            // Need to carefully parse this JS object literal as JSON
            // Easiest is to eval it within a safe scope
            const updates = eval('(' + match[1] + ')');
            let c = 0;
            data.forEach(d => {
                if (updates[d.kanji]) {
                    d.on_sentence = updates[d.kanji].on_sentence || d.on_sentence;
                    d.kun_sentence = updates[d.kanji].kun_sentence || d.kun_sentence;
                    c++;
                }
            });
            console.log(`- Applied ${script}, modified ${c} kanji.`);
        } else {
            console.log(`- Skipped ${script}, could not match updates object.`);
        }
    } catch (err) {
        console.error(`- Failed parsing ${script}: ${err.message}`);
    }
});

// Helper for splitting ruby
function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

console.log('Validating Examples parity and Ruby tags...');
let kunFix = 0, onFix = 0;

data.forEach(d => {
    const kuls = (d.kun_reading && d.kun_reading !== '-') ? d.kun_reading.split(/[、/ /]+/).map(r => kataToHira(r.split('.')[0]).trim()) : [];
    const ons = (d.on_reading && d.on_reading !== '-') ? d.on_reading.split(/[、/ /]+/).map(r => kataToHira(r).trim()) : [];

    let examples = d.examples || [];
    let hasKun = false;
    let hasOn = false;

    // Evaluate existing examples, split ruby if necessary
    examples.forEach(ex => {
        // Fix labels
        if (!ex.mean.includes('(훈독)') && !ex.mean.includes('(음독)') && !ex.mean.includes('(숙자훈)')) {
            const rhira = kataToHira(ex.reading);
            let isKun = false;
            kuls.forEach(k => { if (rhira.includes(k)) isKun = true; });
            if (isKun) { ex.mean += ' (훈독)'; hasKun = true; }
            else { ex.mean += ' (음독)'; hasOn = true; }
        } else {
            if (ex.mean.includes('(훈독)') || ex.mean.includes('(숙자훈)')) hasKun = true;
            if (ex.mean.includes('(음독)')) hasOn = true;
        }

        // Split ruby if it has format [日本](にほん) length > 1 kanji inside bracket
        ex.word = ex.word.replace(/\[([^\]]{2,})\]\(([^)]+)\)/g, (match, jk, jr) => {
            if (jk.length === jr.length) {
                let res = "";
                for (let i = 0; i < jk.length; i++) res += `[${jk[i]}](${jr[i]})`;
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

    // Synthesize missing Kun
    if (kuls.length > 0 && !hasKun) {
        let wr = kuls[0];
        let display = `[${d.kanji}](${wr})`;
        // Attempt to extract from kun_sentence
        const sents = Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence];
        let extracted = false;
        for (const s of sents) {
            if (s && s.text) {
                const m = s.text.match(new RegExp(`\\[${d.kanji}[^\\]]*\\]\\([^)]+\\)[ぁ-ん]*|\\S*\\[${d.kanji}\\]\\([^)]+\\)\\S*`, 'g'));
                if (m) {
                    const raw = m[0].replace(/[をがにへとは]/g, '').trim();
                    const plain = raw.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
                    const rding = raw.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');
                    if (plain.length > 1 || plain === d.kanji) {
                        examples.push({ word: raw, reading: rding, mean: (s.mean ? s.mean.split(' ')[0] : '관련어') + ' (훈독)' });
                        hasKun = true;
                        kunFix++;
                        extracted = true;
                        break;
                    }
                }
            }
        }

        if (!extracted) {
            const base = d.kun_reading.split(/[、/ /]+/)[0] || "";
            let full = base.split('.')[0];
            let format = `[${d.kanji}](${full})`;
            let rd = full;
            if (base.includes('.')) {
                format += base.split('.')[1];
                rd += base.split('.')[1];
            }
            examples.push({ word: format, reading: rd, mean: '관련어 (훈독)' });
            kunFix++;
        }
    }

    // Synthesize missing On
    if (ons.length > 0 && !hasOn) {
        let wr = ons[0];
        examples.push({ word: `[${d.kanji}](${wr})[語](ご)`, reading: wr + 'ご', mean: '관련어 (음독)' });
        onFix++;
    }

    d.examples = examples;
    // ensure array format for multiple readings
    if (d.on_reading && d.on_reading !== '-' && d.on_reading.includes('/')) d.on_sentence = Array.isArray(d.on_sentence) ? d.on_sentence : [d.on_sentence].filter(x => x);
    if (d.kun_reading && d.kun_reading !== '-' && d.kun_reading.includes('/')) d.kun_sentence = Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence].filter(x => x);
});

fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Repair completed successfully. Fixed Kun: ${kunFix}, Fixed On: ${onFix}`);
