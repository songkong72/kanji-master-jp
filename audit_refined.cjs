const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const checkBroken = (text) => {
    if (!text) return false;
    // Real broken patterns:
    if (/\[\]|\(\)/.test(text)) return true; // Empty brackets
    // Unbalanced brackets
    let openB = (text.match(/\[/g) || []).length;
    let closeB = (text.match(/\]/g) || []).length;
    let openP = (text.match(/\(/g) || []).length;
    let closeP = (text.match(/\)/g) || []).length;
    if (openB !== closeB || openP !== closeP) return true;

    // Nested patterns that shouldn't be there
    if (/\[[^\]]*\[|\][^\[]*\]|\([^)]*\(|\)[^\(]*\)/.test(text)) return true;

    return false;
};

const broken = data.filter(d => {
    const sents = [
        ...(Array.isArray(d.on_sentence) ? d.on_sentence : (d.on_sentence ? [d.on_sentence] : [])),
        ...(Array.isArray(d.kun_sentence) ? d.kun_sentence : (d.kun_sentence ? [d.kun_sentence] : []))
    ].map(s => s.text);
    const exs = d.examples.map(ex => ex.word);
    return [...sents, ...exs].some(checkBroken);
});

console.log('Real Broken Count:', broken.length);
if (broken.length > 0) {
    broken.slice(0, 10).forEach(b => {
        console.log(`Kanji: ${b.kanji}`);
        const all = [
            ...(Array.isArray(b.on_sentence) ? b.on_sentence : (b.on_sentence ? [b.on_sentence] : [])),
            ...(Array.isArray(b.kun_sentence) ? b.kun_sentence : (b.kun_sentence ? [b.kun_sentence] : []))
        ].map(s => s.text).concat(b.examples.map(ex => ex.word));
        all.forEach(t => { if (checkBroken(t)) console.log(`  Broken Text: ${t}`); });
    });
}
