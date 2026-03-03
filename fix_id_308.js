import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const it = data.find(p => p.id === 308);
if (it) {
    it.examples = [
        { "word": "描写", "reading": "びょうしゃ", "mean": "묘사 (음독)" },
        { "word": "描く", "reading": "え가쿠", "reading": "えがく", "mean": "그리다 (훈독)" },
        { "word": "描く", "reading": "か쿠", "reading": "かく", "mean": "그리다/쓰다 (훈독)" }
    ];
    // Clean literal fix
    it.examples = [
        { "word": "描写", "reading": "びょうしゃ", "mean": "묘사 (음독)" },
        { "word": "描く", "reading": "えがく", "mean": "그리다 (훈독)" },
        { "word": "描く", "reading": "かく", "mean": "그리다/쓰다 (훈독)" }
    ];

    it.kun_sentence = [
        {
            "text": "キャンバスに[絵](え)を[描](えが)く。",
            "mean": "캔버스에 그림을 그리다."
        },
        {
            "text": "まゆを[描](か)く。",
            "mean": "눈썹을 그리다."
        }
    ];
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ID 308 manually.');
