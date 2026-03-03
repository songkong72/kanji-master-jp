import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const it = data.find(p => p.id === 302);
if (it) {
    it.examples = [
        { "word": "探求", "reading": "たんきゅう", "mean": "탐구 (음독)" },
        { "word": "探す", "reading": "さがす", "mean": "찾다 (훈독)" },
        { "word": "探る", "reading": "さぐる", "mean": "살피다/더듬어 찾다 (훈독)" }
    ];
    it.on_sentence = {
        "text": "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)する。",
        "mean": "우주를 탐구하다."
    };
    it.kun_sentence = [
        {
            "text": "[犯](はん)[人](にん)の[行](ゆ)[方](くえ)를 [探](さが)す。",
            "text": "[犯](はん)[人](にん)の[行](ゆ)[方](くえ)を[探](さが)す。",
            "mean": "범인의 행방을 찾다."
        },
        {
            "text": "[洞](ほら)[穴](あな)の[奥](おく)を[探](사구)る。",
            "text": "[洞](ほら)[穴](아나)の[奥](おく)を[探](さぐ)る。",
            "mean": "동굴 속을 살피다 (더듬어 찾다)."
        }
    ];
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ID 302 data exactly.');
