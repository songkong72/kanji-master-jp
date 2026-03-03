const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const fixMap = {
    "掃": [{ word: "掃除", reading: "そうじ", mean: "청소" }, { word: "掃く", reading: "はく", mean: "쓸다" }],
    "採": [{ word: "採用", reading: "さいよう", mean: "채용" }, { word: "採る", reading: "とる", mean: "채집하다/뽑다" }],
    "描": [{ word: "描写", reading: "びょうしゃ", mean: "묘사" }, { word: "描く", reading: "えがく", mean: "그리다" }],
    "捜": [{ word: "捜査", reading: "そうさ", mean: "수사" }, { word: "捜す", reading: "さがす", mean: "찾다" }],
    "操": [{ word: "操作", reading: "そうさ", mean: "조작" }, { word: "操る", reading: "あやつる", mean: "다루다" }],
    "故": [{ word: "故障", reading: "こしょう", mean: "고장" }, { word: "故に", reading: "ゆえに", mean: "고로/때문에" }],
    "救": [{ word: "救助", reading: "きゅうじょ", mean: "구조" }, { word: "救う", reading: "すくう", mean: "구하다" }],
    "敵": [{ word: "素敵", reading: "すてき", mean: "멋짐" }, { word: "敵", reading: "かたき", mean: "원수" }],
    "敷": [{ word: "敷く", reading: "しく", mean: "깔다" }, { word: "敷設", reading: "ふせつ", mean: "부설" }],
    "承": [{ word: "承諾", reading: "しょうだく", mean: "승낙" }, { word: "承る", reading: "うけたまわる", mean: "듣다/받들다" }],
    "担": [{ word: "担当", reading: "たんとう", mean: "담당" }, { word: "担ぐ", reading: "かつぐ", mean: "메다/짊어지다" }],
    "抑": [{ word: "抑制", reading: "よくせい", mean: "억제" }, { word: "抑える", reading: "おさえる", mean: "누르다/억제하다" }],
    "拝": [{ word: "拝借", reading: "はいしゃく", mean: "빌림(겸양)" }, { word: "拝む", reading: "おがむ", mean: "절하다/빌다" }],
    "拭": [{ word: "拭く", reading: "ふく", mean: "닦다" }, { word: "払拭", reading: "ふっしょく", mean: "불식" }],
    "授": [{ word: "授業", reading: "じゅぎょう", mean: "수업" }, { word: "授ける", reading: "さずける", mean: "하사하다/수여하다" }],
    "措": [{ word: "措置", reading: "そち", mean: "조치" }, { word: "措く", reading: "おく", mean: "두다/제외하다" }],
    "掲": [{ word: "掲示", reading: "けいじ", mean: "게시" }, { word: "掲げる", reading: "かかげる", mean: "내걸다" }],
    "提": [{ word: "提案", reading: "ていあん", mean: "제안" }, { word: "提げる", reading: "さげる", mean: "들다/휴대하다" }],
    "揚": [{ word: "揚揚", reading: "ようよう", mean: "양양함" }, { word: "揚げる", reading: "あげる", mean: "올리다" }],
    "探": [{ word: "探求", reading: "たんきゅう", mean: "탐구" }, { word: "探す", reading: "さがす", mean: "찾다" }]
};

let count = 0;
data.forEach(d => {
    if (fixMap[d.kanji]) {
        d.examples = fixMap[d.kanji];
        count++;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Diversified examples for ${count} kanjis.`);
