const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const commonSplits = {
    // 3 Kanji
    "日本語": ["[日](に)", "[本](ほん)", "[語](ご)"],
    "日曜日": ["[日](にち)", "[曜](よう)", "[日](び)"],
    "月曜日": ["[月](げつ)", "[曜](よう)", "[日](び)"],
    "火曜日": ["[火](か)", "[曜](よう)", "[日](び)"],
    "水曜日": ["[水](すい)", "[曜](よう)", "[日](び)"],
    "木曜日": ["[木](もく)", "[曜](よう)", "[日](び)"],
    "金曜日": ["[金](きん)", "[曜](よう)", "[日](비)"], // fix '비'
    "金曜日": ["[金](きん)", "[曜](よう)", "[日](び)"],
    "土曜日": ["[土](ど)", "[曜](よう)", "[日](び)"],
    "図書館": ["[도](と)", "[書](しょ)", "[館](かん)"], // fix '도'
    "図書館": ["[図](と)", "[書](しょ)", "[館](かん)"],
    "自動車": ["[自](じ)", "[動](どう)", "[車](しゃ)"],

    // 2 Kanji
    "日本": ["[日](に)", "[本](ほん)"],
    "探求": ["[探](たん)", "[求](きゅう)"],
    "想像": ["[想](そう)", "[상](ぞう)"], // fix '상'
    "想像": ["[想](そう)", "[像](ぞう)"],
    "勉強": ["[勉](べん)", "[強](きょう)"],
    "一番": ["[一](いち)", "[番](ばん)"],
    "昨日": ["[昨](き)", "[日](のう)"],
    "今日": ["[今](き)", "[日](ょう)"],
    "明日": ["[明](あ)", "[日](した)"],
    "時間": ["[時](じ)", "[間](かん)"],
    "以前": ["[以](い)", "[前](ぜん)"],
    "最後": ["[最](さい)", "[後](ご)"],
    "最初": ["[最](さい)", "[初](しょ)"],
    "最近": ["[最](さい)", "[近](きん)"],
    "電話": ["[電](でん)", "[話](わ)"],
    "生活": ["[生](せい)", "[活](かつ)"],
    "先生": ["[先](せん)", "[生](せい)"],
    "学校": ["[学](がっ)", "[校](こう)"],
    "学生": ["[学](がく)", "[生](せい)"],
    "会社": ["[회](かい)", "[社](しゃ)"], // fix '회'
    "会社": ["[会](かい)", "[社](しゃ)"],
    "仕事": ["[仕](し)", "[事](ごと)"],
    "自分": ["[自](じ)", "[分](ぶん)"],
    "世界": ["[世](せ)", "[界](かい)"],
    "平和": ["[平](へい)", "[和](わ)"],
    "意味": ["[意](い)", "[味](み)"],
    "理由": ["[理](り)", "[由](ゆう)"],
    "四肢": ["[四](し)", "[肢](し)"],
    "四捨五入": ["[四](し)", "[捨](しゃ)", "[五](ご)", "[入](にゅう)"]
};

let fixes = 0;
data.forEach(d => {
    let changed = false;
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, reading) => {
            if (kanjis.length > 1 && kanjis.includes(d.kanji)) {
                // Heuristic 1: Predefined map
                if (commonSplits[kanjis]) {
                    return commonSplits[kanjis].join('');
                }

                // Heuristic 2: Equal length
                if (kanjis.length === reading.length) {
                    let res = '';
                    for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${reading[i]})`;
                    return res;
                }

                // Heuristic 3: 2 kanjis, reading length 4
                if (kanjis.length === 2 && reading.length === 4) {
                    return `[${kanjis[0]}](${reading.substring(0, 2)})[${kanjis[1]}](${reading.substring(2)})`;
                }
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });
    if (changed) fixes++;
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Final Granular Sweep: Fixed ${fixes} items.`);
