const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const topQuality = {
    "一": [{ w: "一番", r: "いちばん", m: "가장/첫째" }, { w: "一つ", r: "ひとつ", m: "한 개" }],
    "九": [{ w: "九月", r: "くがつ", m: "9월" }, { w: "九つ", r: "こ개의", m: "아홉 개" }],
    "十": [{ w: "十分", r: "じゅうぶん", m: "충분히" }, { w: "十日", r: "とおか", m: "10일" }],
    "故": [{ w: "故障", r: "こしょう", m: "고장" }, { w: "故郷", r: "こきょう", m: "고향" }],
    "攻": [{ w: "攻撃", r: "こうげ기", m: "공격" }, { w: "攻める", r: "세메루", m: "공격하다" }],
    "蕩": [{ w: "放蕩", r: "ほうとう", m: "방탕" }, { w: "蕩尽", r: "とうじん", m: "탕진" }],
    "捨": [{ w: "四捨五入", r: "ししゃごにゅう", m: "반올림" }, { w: "使い捨て", r: "つかいすて", m: "일회용" }],
    "代": [{ w: "時代", r: "じだい", m: "시대" }, { w: "交代", r: "こうたい", m: "교대" }, { w: "代わる", r: "かわる", m: "대신하다" }],
    "世": [{ w: "世紀", r: "세이키", m: "세기" }, { w: "世話", r: "세와", m: "도움" }, { w: "世の中", r: "요노나카", m: "세상" }]
};

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

data.forEach(d => {
    if (topQuality[d.kanji]) {
        d.examples = topQuality[d.kanji].map(item => ({
            word: item.w,
            reading: item.r.replace(/[가-힣]/g, ''),
            mean: item.m
        }));
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('TOP QUALITY RESTORED');
