const fs = require('fs');

const d = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

// Build a global dictionary of kanji words -> ruby formatted words
const dict = {};

// Common words that we know the ruby for, to supplement
const manualDict = {
    '椅子': '[椅子](いす)',
    '店': '[店](みせ)',
    '星': '[星](ほし)',
    '夜空': '[夜空](よぞら)',
    '意味': '[意味](いみ)',
    '覚える': '[覚](おぼ)える',
    '教え': '[教](おし)え',
    '師': '[師](し)',
    '天気': '[天気](てんき)',
    '外国': '[外国](がいこく)',
    '先生': '[先生](せんせい)',
    '会社': '[会社](かいしゃ)',
    '学校': '[学校](がっこう)',
    '小学校': '[小学校](しょうがっこう)',
    '中学校': '[中学校](ちゅうがっこう)',
    '高校': '[高校](こうこう)',
    '大学': '[大学](だいがく)',
    '火曜日': '[火曜日](かようび)',
    '水曜日': '[水曜日](すいようび)',
    '木曜日': '[木曜日](もくようび)',
    '金曜日': '[金曜日](きんようび)',
    '土曜日': '[土曜日](どようび)',
    '日曜日': '[日曜日](にちようび)',
    '貸家': '[貸家](かしや)',
    '動物': '[動物](どうぶつ)',
    '祭日': '[祭日](さいじつ)',
};

d.forEach(k => {
    if (k.examples) {
        k.examples.forEach(e => {
            if (e.word && e.reading) {
                const bare = e.word.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
                if (bare.length >= 1 && /[一-龯]/.test(bare)) { // only add entries containing kanji
                    if (!dict[bare] || dict[bare].length < e.word.length) {
                        dict[bare] = e.word;
                    }
                }
            }
        });
    }
});

Object.assign(dict, manualDict);

// Sort dictionary by length descending so we match longer compounds first
const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

let modifiedCount = 0;

d.forEach(k => {
    let modified = false;

    const processText = (s) => {
        if (!s || !s.text || s.text === '-') return;

        let oldText = s.text;

        // Strip some bad manual formats like 新(あたら)しい -> [新](あたら)しい
        s.text = s.text.replace(/([一-龯]+)\(([^)]+)\)/g, '[$1]($2)');

        // Custom fix for 「(word)」の意味を覚える。
        const meaningMatch = s.text.match(/「([一-龯]+)」の\[意味\]\(いみ\)を\[覚\]\(おぼ\)える。/);
        if (meaningMatch) {
            const word = meaningMatch[1];
            if (dict[word]) {
                s.text = s.text.replace(`「${word}」`, `「${dict[word]}」`);
            } else {
                // we can assume the on_reading of current kanji if length is 1? No, better use examples 
            }
        }

        // Custom fix for "의미 생략"
        if (s.mean === '의미 생략' || s.mean === '의미생략') {
            if (s.text.includes('意味を覚える')) {
                const wMatch = s.text.match(/「([^」]+)」の/);
                if (wMatch) {
                    const cleanWord = wMatch[1].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
                    s.mean = `'${cleanWord}'의 의미를 외우다.`;
                }
            } else if (s.text.includes('[新](あたら)しい')) {
                const mainG = s.text.replace(/.*新しい\[([^\]]+)\].*/, '$1');
                if (mainG && mainG !== s.text) {
                    s.mean = `새로운 ${mainG}.`;
                } else {
                    s.mean = '새롭다.';
                }
            } else {
                s.mean = '(의미 업데이트 필요)'; // temporary fallback
            }
        }

        // Generic search and replace for missing ruby kanji
        sortedKeys.forEach(bare => {
            // If the bare word exists and it's NOT already in a ruby format [bare](...)
            // This regex checks if 'bare' is in the string, but NOT preceded by '[' or followed by ']('
            // It's tricky with regex, so we iterate:
            if (!/[一-龯]/.test(bare)) return;

            // Simplified approach: replace bare word only if it's not surrounded by brackets already
            // We use a regex with negative lookbehind and lookahead
            const regex = new RegExp(`(?<!\\[)${bare}(?!\\]\\()`, 'g');
            if (regex.test(s.text)) {
                s.text = s.text.replace(regex, dict[bare]);
            }
        });

        // specific ad-hoc fixes from the log
        s.text = s.text.replace(/これは\[\[([^\]]+)\]\(([^)]+)\)([^\]]+)\]\(([^)]+)\)だ。/g, 'これは[$1]($2)[$3]($4)だ。'); // Fix double nesting [[]()]()

        if (oldText !== s.text) modified = true;
    };

    if (k.on_sentence) {
        let arr = Array.isArray(k.on_sentence) ? k.on_sentence : [k.on_sentence];
        arr.forEach(processText);
    }
    if (k.kun_sentence) {
        let arr = Array.isArray(k.kun_sentence) ? k.kun_sentence : [k.kun_sentence];
        arr.forEach(processText);
    }

    // Fix "의미 생략" in examples 
    if (k.examples) {
        k.examples.forEach(e => {
            if (e.mean === '의미 생략' || e.mean === '의미생략') {
                e.mean = '(의미 업데이트 필요)';
            }
            if (e.word === '[信[仰](あお)](しんこう)') {
                e.word = '[信仰](しんこう)';
                modified = true;
            }
        });
    }

    // Fix the specific Kanji 仰 (617)
    if (k.kanji === '仰') {
        k.on_sentence.forEach(s => {
            if (s.text.includes('これは')) {
                s.text = 'これは[信仰](しんこう)だ。';
                s.mean = '이것은 신앙이다.';
                modified = true;
            }
            if (s.text.includes('意味を覚える')) {
                s.text = '「[信仰](しんこう)」の[意味](いみ)を[覚](おぼ)える。';
                s.mean = "'신앙'의 의미를 외우다.";
                modified = true;
            }
            if (s.text.includes('夜空')) {
                s.text = '[夜空](よぞら)を[仰](あお)いで[星](ほし)を[数](かぞ)える。';
            }
        });
        k.kun_sentence.forEach(s => {
            if (s.text.includes('よく')) {
                s.text = 'よく[仰](おっしゃ)る。';
                s.mean = '자주 말씀하신다.';
                modified = true;
            }
            if (s.text.includes('師')) {
                s.text = '[師](し)の[教](おし)えを[仰](あお)ぐ。';
            }
        });
    }

    if (modified) modifiedCount++;
});

fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(d, null, 2));
console.log('Modified entries:', modifiedCount);
