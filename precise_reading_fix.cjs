const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const preciseFixes = {
    "判": [
        { word: "判断", reading: "はんだん" },
        { word: "判子", reading: "はんこ" }
    ],
    "蘭": [
        { word: "蘭", reading: "らん" },
        { word: "蘭陀", reading: "おらんだ" } // It was written in examples as 蘭 with reading 를란다 (Holland normally written as オランダ but for app use hiragana)
    ],
    "蓮": [
        { word: "蓮華", reading: "れんげ" },
        { word: "蓮", reading: "はす" }
    ],
    "藩": [
        { word: "藩主", reading: "はんしゅ" },
        { word: "廃藩置県", reading: "はいはんちけん" }
    ],
    "禧": [
        { word: "年禧", reading: "ねんき" }
    ],
    "祓": [
        { word: "お祓い", reading: "おはらい" },
        { word: "祓除", reading: "ふつじょ" }
    ],
    "箋": [
        { word: "処방箋", reading: "しょほうせん" }, // wait word has korean '방'
        { word: "処方箋", reading: "しょほうせん" },
        { word: "付箋", reading: "ふせん" },
        { word: "便箋", reading: "びんせん" }
    ]
};

data.forEach(d => {
    if (preciseFixes[d.kanji]) {
        d.examples.forEach(ex => {
            const fix = preciseFixes[d.kanji].find(f => f.word === ex.word);
            if (fix) {
                ex.reading = fix.reading;
            }
        });
        // Check word as well for Korean
        d.examples.forEach(ex => {
            if (ex.word === "処방箋") ex.word = "処方箋";
            if (ex.word.includes('은/')) ex.word = ex.word.split('은/')[1] || ex.word; // Cleanup weird residues
        });
    }
});

// One more scan for ANY Korean in reading of ANY kanji (N1~N5)
const korToJapChar = {
    '단': 'だん', '한': 'はん', '란': 'らん', '넨': 'ねん', '의': 'い', '죠': 'じょ', '선': 'せん', '켄': 'けん'
};

data.forEach(d => {
    if (d.examples) {
        d.examples.forEach(ex => {
            if (/[가-힣]/.test(ex.reading)) {
                ex.reading = ex.reading.replace(/[가-힣]/g, (match) => korToJapChar[match] || '');
            }
        });
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log("Precise fixes applied for remaining problematic readings.");
