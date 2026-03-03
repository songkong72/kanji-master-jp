const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// List of common N5-N1 Jukujikun/Ateji
const jukujikunMap = {
    '今日': { reading: 'きょう', mean: '오늘' },
    '明日': { reading: 'あした', mean: '내일' },
    '昨日': { reading: 'きのう', mean: '어제' },
    '一昨日': { reading: 'おととい', mean: '그저께' },
    '明後日': { reading: 'あさって', mean: '모레' },
    '今年': { reading: 'ことし', mean: '올해' },
    '大人': { reading: 'おとな', mean: '어른' },
    '時計': { reading: 'とけい', mean: '시계' },
    '眼鏡': { reading: 'めがね', mean: '안경' },
    '田舎': { reading: 'いなか', mean: '시골' },
    '風邪': { reading: 'かぜ', mean: '감기' },
    '果物': { reading: 'くだもの', mean: '과일' },
    '迷子': { reading: 'まいご', mean: '미아' },
    '紅葉': { reading: 'もみじ', mean: '단풍' },
    '梅雨': { reading: 'つゆ', mean: '장마' },
    '二十歳': { reading: 'はたち', mean: '스무 살' },
    '二十日': { reading: 'はつか', mean: '20일' },
    '一日': { reading: 'ついたち', mean: '초하루(1일)' },
    '二日': { reading: 'ふつか', mean: '이틀' },
    '三日': { reading: 'みっか', mean: '사흘' },
    '四日': { reading: 'よっか', mean: '나흘' },
    '五日': { reading: 'いつか', mean: '닷새' },
    '六日': { reading: 'むいか', mean: '엿새' },
    '七日': { reading: 'なのか', mean: '이레' },
    '八日': { reading: 'ようか', mean: '여드레' },
    '九日': { reading: 'ここのか', mean: '아흐레' },
    '十日': { reading: 'とおか', mean: '열흘' },
    '八百屋': { reading: 'やおや', mean: '채소가게' },
    '上手': { reading: 'じょうず', mean: '능숙함' }, // Although jo-zu uses ON readings mostly, it's often confusing
    '下手': { reading: 'へた', mean: '서투름' }, // heta is ateji
    '息子': { reading: 'むすこ', mean: '아들' },
    '吹雪': { reading: 'ふぶき', mean: '눈보라' },
    '真面目': { reading: 'まじめ', mean: '성실함' },
    '土産': { reading: 'みやげ', mean: '선물' },
    '海老': { reading: 'えび', mean: '새우' },
    '小豆': { reading: 'あずき', mean: '팥' }
};

let c = 0;

data.forEach(d => {
    // 1. Fix existing labels
    if (d.examples) {
        d.examples.forEach(e => {
            let plainWord = e.word.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            for (let [jword, info] of Object.entries(jukujikunMap)) {
                if (plainWord === jword || plainWord.includes(jword)) {
                    // Check if it's currently marked as anything else
                    if (e.mean.includes('(음독)') || e.mean.includes('(훈독)') || !e.mean.includes('(훈독/특수)')) {
                        e.mean = e.mean.replace(/\(음독\)|\(훈독\)|\(숙자훈\)|\(특수\)/g, '').trim() + ' (훈독/특수)';
                        c++;
                    }
                }
            }
        });
    }

    // 2. Add if kanji is part of jukujikun and it is not in examples
    for (let [jword, info] of Object.entries(jukujikunMap)) {
        if (jword.includes(d.kanji)) {
            // See if we already have it
            let hasIt = d.examples.some(e => e.word.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') === jword);
            if (!hasIt) {
                d.examples.push({
                    word: jword,
                    reading: info.reading,
                    mean: `${info.mean} (훈독/특수)`
                });
                c++;
            }
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed/Added special readings:', c);
