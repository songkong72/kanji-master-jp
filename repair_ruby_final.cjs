const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Reading Dictionary
const dict = {};
data.forEach(d => {
    const ons = (d.on_reading || "").split(/[、/ /]+/).map(s => s.trim()).filter(Boolean);
    const kuns = (d.kun_reading || "").split(/[、/ /]+/).map(s => s.trim()).filter(Boolean);
    dict[d.kanji] = kataToHira(ons[0] || (kuns[0] || "").split('.')[0] || "o");
});

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function repairRuby(text) {
    if (!text) return text;
    let s = text;

    // 1. Fix []([K](r)) -> [K](r)
    s = s.replace(/\[\]\(\[([^\]]+)\]\(([^)]+)\)\)/g, '[$1]($2)');

    // 2. Fix nested duplicates [K](r)(r) -> [K](r)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)\(([^)]*)\)/g, '[$1]($2)');

    // 3. Fix [K]() by looking up dict
    s = s.replace(/\[([^\]])\]\(\)/g, (match, k) => {
        return `[${k}](${dict[k] || 'o'})`;
    });

    // 4. Fix unbalanced [K(r) or K](r)
    // This is harder with regex, but let's fix common artifacts
    s = s.replace(/\[\[/g, '[').replace(/\]\]/g, ']');
    s = s.replace(/\(\(/g, '(').replace(/\)\)/g, ')');

    return s;
}

data.forEach(d => {
    const polish = (obj) => {
        if (!obj) return;
        if (Array.isArray(obj)) obj.forEach(s => s.text = repairRuby(s.text));
        else if (obj.text) obj.text = repairRuby(obj.text);
    };
    polish(d.on_sentence);
    polish(d.kun_sentence);
    d.examples.forEach(ex => ex.word = repairRuby(ex.word));
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('FINAL RUBY REPAIR COMPLETE: All detected artifacts fixed.');
