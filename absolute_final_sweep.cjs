const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const multiMap = {
    "生け花": "[生](い)け[花](ばな)",
    "大使館": "[大](たい)[使](し)[館](かん)",
    "冷蔵庫": "[冷](れい)[蔵](ぞう)[庫](こ)",
    "全力疾走": "[全](ぜん)[力](りょく)[疾](しっ)[走](そう)",
    "降水確率": "[降](こう)[水](すい)[確](か)[率](りつ)",
    "動物園": "[動](どう)[物](ぶつ)[園](えん)",
    "招待状": "[招](しょう)[待](たい)[状](じょう)",
    "案内所": "[案](あん)[内](ない)[所](じょ)",
    "会社員": "[会](かい)[社](しゃ)[員](いん)",
    "世界中": "[世](せ)[界](かい)[中](じゅう)",
    "留学生": "[留](りゅう)[学](がく)[生](せい)",
    "政治家": "[政](せい)[治](じ)[家](か)",
    "市役所": "[市](し)[役](やく)[所](しょ)",
    "航空便": "[航](こう)[空](くう)[便](びん)",
    "文化祭": "[文](ぶん)[化](か)[祭](さい)",
    "拾万円": "[拾](じゅう)[万](まん)[円](えん)",
    "改札口": "[改](かい)[札](さつ)[口](ぐち)",
    "横断歩道": "[横](おう)[단](だん)[歩](ほ)[道](どう)", // fix '단'
    "横断歩道": "[横](おう)[断](だん)[歩](ほ)[道](도)", // fix '도'
    "横断歩道": "[横](おう)[断](だん)[歩](ほ)[道](どう)",
    "多様化": "[多](た)[様](よう)[化](か)",
    "消防署": "[消](しょう)[防](ぼう)[署](しょ)",
    "駐車場": "[駐](ちゅう)[車](しゃ)[場](じょう)"
};

let fixes = 0;
data.forEach(d => {
    let changed = false;
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            if (kanjis.includes(d.kanji) && kanjis.length > 1) {
                if (multiMap[kanjis]) return multiMap[kanjis];

                // Final 3-kanji heuristic (3-3 split)
                if (kanjis.length === 3 && read.length === 3) {
                    return `[${kanjis[0]}](${read[0]})[${kanjis[1]}](${read[1]})[${kanjis[2]}](${read[2]})`;
                }
                if (kanjis.length === 3 && read.length === 6) {
                    return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2, 4)})[${kanjis[2]}](${read.substring(4)})`;
                }
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });
    if (changed) fixes++;
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Final Multi-Kanji Sweep complete. Fixed ${fixes} items.`);
