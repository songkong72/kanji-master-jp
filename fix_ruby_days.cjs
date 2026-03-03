const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let c = 0;
data.forEach(k => {
    const fixList = [
        { bad: '三[日](みっか)', good: '[三日](みっか)' },
        { bad: '今[日](きょう)', good: '[今日](きょう)' },
        { bad: '明[日](あした)', good: '[明日](あした)' },
        { bad: '明[日](あす)', good: '[明日](あす)' },
        { bad: '昨[日](きのう)', good: '[昨日](きのう)' },
        { bad: '一[日](いちにち)', good: '[一日](いちにち)' },
        { bad: '一[日](ついたち)', good: '[一日](ついたち)' },
        { bad: '二[日](ふつか)', good: '[二日](ふつか)' },
        { bad: '四[日](よっか)', good: '[四日](よっか)' },
        { bad: '五[日](いつか)', good: '[五日](いつか)' },
        { bad: '六[日](むいか)', good: '[六日](むいか)' },
        { bad: '七[日](なのか)', good: '[七日](なのか)' },
        { bad: '八[日](ようか)', good: '[八日](ようか)' },
        { bad: '九[日](ここのか)', good: '[九日](ここのか)' },
        { bad: '十[日](とおか)', good: '[十日](とおか)' },
        { bad: '二[十][日](はつか)', good: '[二十日](はつか)' },
        { bad: '二十[日](はつか)', good: '[二十日](はつか)' },
        { bad: '大[人](おとな)', good: '[大人](おとな)' },
        { bad: '一[人](ひとり)', good: '[一人](ひとり)' },
        { bad: '二[人](ふたり)', good: '[二人](ふたり)' },
        { bad: '一[緒](いっしょ)', good: '[一緒](いっしょ)' },
        { bad: '一[つ](ひとつ)', good: '[一つ](ひとつ)' },
        { bad: '二[つ](ふたつ)', good: '[二つ](ふたつ)' }
    ];

    const fixSent = (s) => {
        if (!s) return;
        if (s.text) {
            fixList.forEach(f => {
                if (s.text.includes(f.bad)) {
                    s.text = s.text.replace(f.bad, f.good);
                    c++;
                    console.log(`Fix in ${k.kanji}: ${f.bad} -> ${f.good}`);
                }
            });
        }
    };
    if (k.on_sentence) k.on_sentence.forEach(fixSent);
    if (k.kun_sentence) k.kun_sentence.forEach(fixSent);

    // Also check examples
    if (k.examples) {
        k.examples.forEach(e => {
            if (e.word) {
                fixList.forEach(f => {
                    if (e.word.includes(f.bad)) {
                        e.word = e.word.replace(f.bad, f.good);
                        c++;
                        console.log(`Fix in ${k.kanji} word: ${f.bad} -> ${f.good}`);
                    }
                });
            }
        });
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Fixed', c, 'ruby malformations.');
