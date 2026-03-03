const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Build Global Dictionary (Kanji -> Typical Reading)
const dict = {};
data.forEach(d => {
    const kanji = d.kanji;
    // Primary readings from header
    const primaries = [
        ...d.on_reading.split(/[、/]+/).map(r => r.trim()).filter(r => r && r !== '-'),
        ...d.kun_reading.split(/[、/]+/).map(r => r.trim().split('.')[0]).filter(r => r && r !== '-')
    ];
    if (primaries.length > 0) {
        dict[kanji] = primaries[0]; // Take the first one as default
    }

    // Supplement from examples
    d.examples.forEach(ex => {
        if (ex.word.length === 1 && /[\u4e00-\u9faf]/.test(ex.word)) {
            dict[ex.word] = ex.reading;
        }
    });
});

// Hardcoded common ones if missing
dict['中'] = 'なか';
dict['日'] = 'にち';
dict['本'] = 'ほん';
dict['人'] = 'ひと';
dict['何'] = 'なに';
dict['私'] = 'わたし';
dict['今'] = 'いま';

function kataToHira(kata) {
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

// 2. Powerful Ruby-fication Function
function applyRuby(text, targetKanji, targetOn, targetKun) {
    if (!text) return text;

    // A. First, fix corrupt rubies like [히라가나](...) or [漢](한글)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, jk, jr) => {
        // Remove Korean from reading part
        const cleanJr = jr.replace(/[가-힣]/g, '').trim();
        // If kanji part is actually kana, just return the kana
        if (/^[\u3040-\u309f\u30a0-\u30ff]+$/.test(jk)) return jk;
        return `[${jk}](${cleanJr})`;
    });

    // B. Inject Ruby for naked Kanji
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = kanjiRegex.exec(text)) !== null) {
        const char = match[0];
        const index = match.index;

        // Check if this char is already inside a [ ]( )
        let inRuby = false;
        const rubyRegex = /\[([^\]]*?)\]\(([^)]*?)\)/g;
        let rMatch;
        while ((rMatch = rubyRegex.exec(text)) !== null) {
            if (index >= rMatch.index && index < rMatch.index + rMatch[0].length) {
                inRuby = true;
                break;
            }
        }

        if (inRuby) continue;

        // Not in ruby. Find a reading.
        let reading = dict[char] || 'o'; // Fallback
        if (char === targetKanji) {
            reading = targetKun !== '-' ? targetKun.split(/[、/]+/)[0].split('.')[0] : targetOn.split(/[、/]+/)[0];
        }

        // Append text before this char
        result += text.substring(lastIndex, index);
        result += `[${char}](${kataToHira(reading)})`;
        lastIndex = index + 1;
    }
    result += text.substring(lastIndex);

    // C. Remove any remaining Korean
    return result.replace(/[가-힣]/g, '').trim();
}

// 3. Process Everything
data.forEach(d => {
    const targetOn = d.on_reading;
    const targetKun = d.kun_reading;

    const process = (obj) => {
        if (!obj) return;
        if (Array.isArray(obj)) {
            obj.forEach(item => { if (item.text) item.text = applyRuby(item.text, d.kanji, targetOn, targetKun); });
        } else if (obj.text) {
            obj.text = applyRuby(obj.text, d.kanji, targetOn, targetKun);
        }
    };

    process(d.on_sentence);
    process(d.kun_sentence);

    d.examples.forEach(ex => {
        ex.word = applyRuby(ex.word, d.kanji, targetOn, targetKun);
        // Ensure example word doesn't have Korean in reading
        if (ex.reading) ex.reading = ex.reading.replace(/[가-힣]/g, '').trim();
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('RUBY ENFORCEMENT COMPLETE: All Kanji now have ruby text.');
