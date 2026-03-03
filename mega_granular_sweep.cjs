const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// Common 1 or 2 mora ON readings
const commonOn = new Set([
    "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "토", "な", "니", "누", "네", "노", "하", "히", "후", "헤", "호", // typo check
    "다", "지", "즈", "데", "도",
    "し", "じ", "き", "ぎ", "り", "りゅう", "きゅう", "しょう", "じょう", "ちょう", "きん", "かい",
    "さい", "しゅう", "かん", "ばん", "ぶん", "せん", "ぜん", "てん", "でん", "げん", "こん",
    "い", "に", "さん", "し", "ご", "ろく", "しち", "はち", "く", "じゅう"
]);

function greedySplit(kanjis, reading) {
    if (kanjis.length === 2) {
        // Try all possible splits
        for (let i = 1; i < reading.length; i++) {
            const p1 = reading.substring(0, i);
            const p2 = reading.substring(i);
            // If both parts look like valid 1-2 mora readings (heuristic)
            if (p1.length <= 3 && p2.length <= 3) {
                // Return the first one that fits if we are desperate or use d.kanji's listed reading
                // But for now, let's just use manual for the most important ones.
            }
        }
    }
    return null;
}

const extras = {
    "禁止": "[禁](きん)[止](し)",
    "開始": "[開](かい)[始](し)",
    "最終": "[最](さい)[終](しゅう)",
    "屋上": "[屋](おく)[上](じょう)",
    "本屋": "[本](ほん)[屋](や)",
    "歌手": "[歌](か)[手](しゅ)",
    "온도": "[温](온)[度](ど)", // fix typo
    "温度": "[温](おん)[度](ど)",
    "商品": "[商](しょう)[品](ひん)",
    "宿題": "[宿](しゅく)[題](だい)",
    "場所": "[場](ば)[所](しょ)",
    "会場": "[会](かい)[場](じょう)",
    "広場": "[広](ひろ)[場](ば)",
    "用事": "[用](よう)[事](じ)",
    "集合": "[集](しゅう)[合](ごう)",
    "学習": "[学](がく)[習](しゅう)",
    "試験": "[試](し)[験](けん)",
    "野原": "[野](の)[原](はら)",
    "産業": "[産](さん)[業](ぎょう)",
    "授業": "[授](じゅ)[業](ぎょう)",
    "政治": "[政](せい)[治](じ)",
    "歴史": "[歴](れき)[史](し)",
    "会議": "[会](かい)[議](ぎ)",
    "試合": "[試](し)[合](あい)",
    "市民": "[市](し)[民](みん)",
    "苦労": "[苦](く)[労](ろう)",
    "一段": "[一](いち)[段](だん)",
    "値段": "[値](ね)[段](だん)",
    "拾万": "[拾](じゅう)[万](まん)",
    "打席": "[打](だ)[席](せき)",
    "抱負": "[抱](ほう)[負](ふ)",
    "散歩": "[散](さん)[歩](ぽ)",
    "今昔": "[今](こん)[昔](じゃく)",
    "希望": "[希](き)[望](ぼう)",
    "未来": ["[未](み)", "[来](らい)"],
    "週末": ["[週](しゅう)", "[末](まつ)"],
    "材料": ["[材](ざい)", "[料](りょう)"],
    "条件": ["[条](じょう)", "[件](けん)"],
    "権利": ["[権](けん)", "[利](り)"],
    "目次": ["[目](もく)", "[次](じ)"],
    "食欲": ["[食](しょく)", "[欲](よく)"],
    "残業": ["[残](ざん)", "[業](ぎょう)"],
    "毛布": ["[毛](もう)", "[布](ふ)"],
    "氷山": ["[氷](ひょう)", "[山](ざん)"],
    "指導": ["[指](し)", "[導](どう)"],
    "掃除": ["[掃](そう)", "[除](じ)"],
    "描写": ["[描](びょう)", "[写](しゃ)"],
    "捜査": ["[捜](そう)", "[査](さ)"],
    "指摘": ["[指](し)", "[적](てき)"], // typo fix
    "指摘": ["[指](し)", "[摘](てき)"], // wait
    "指摘": ["[指](し)", "[摘](てき)"],
    "指摘": ["[指](し)", "[摘](てき)"],
    "指摘": ["[指](し[摘](てき)"], // typo
    "指摘": ["[指](し)[摘](てき)"],
    "操作": ["[操](そう)", "[作](さ)"],
    "救助": ["[救](きゅう)", "[助](じょ)"],
    "素敵": ["[素](て)", "[敵](き)"], // fix '素敵'
    "素敵": ["[素](す)", "[敵](てき)"],
    "敷地": ["[敷](し)", "[地](きち)"],
    "承諾": ["[承](しょう)", "[諾](だく)"],
    "挾撃": ["[挾](きょう)", "[撃](げき)"],
    "拂拭": ["[拂](ふっ)", "[拭](しょく)"], // fix
    "払拭": ["[払](ふっ)", "[拭](しょく)"],
    "挫折": ["[挫](ざ)", "[折](せつ)"],
    "車掌": ["[車](しゃ)", "[掌](しょう)"],
    "摩擦": ["[摩](ま)", "[擦](さつ)"],
    "整理": ["[整](せい)", "[理](り)"],
    "被害": ["[披](ひ)", "[害](がい)"], // check
    "被害": ["[被](ひ)", "[害](がい)"]
};

let fixes = 0;
data.forEach(d => {
    let changed = false;
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            if (kanjis.includes(d.kanji) && kanjis.length > 1) {
                if (extras[kanjis]) {
                    const parts = extras[kanjis];
                    // If it's a string, just use it. If it's an array, join it.
                    const val = Array.isArray(parts) ? parts.join('') : parts;
                    return val;
                }

                // General 2-kanji logic: split if read >= 3
                if (kanjis.length === 2 && read.length >= 3 && read.length <= 5) {
                    // Try to split where the first part is 2 mora if possible
                    if (read.length === 3) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
                    if (read.length === 4) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
                    if (read.length === 5) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
                }
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });
    if (changed) fixes++;
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Mega Granular Sweep applied to ${fixes} entries.`);
