const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 2); // 一
if (target) {
    target.on_reading = "イチ / イツ";
    target.on_sentence = [
        { "text": "[一](いち)[番](ばん)[好](す)きだ。", "mean": "가장 좋아한다." },
        { "text": "[一](いっ)[緒](しょ)に[行](い)く。", "mean": "함께 가다. (촉음 변형)" }
    ];
    target.kun_reading = "ひと / ひと.つ";
    target.kun_sentence = [
        { "text": "[一](ひと)[人](り)で[行](이)く。", "mean": "혼자서 가다." },
        { "text": "[一](ひと)[つ]ください。", "mean": "하나 주세요. (수량 세기)" }
    ];
    // Clean Korean from text
    target.kun_sentence[0].text = "[一](ひと)[人](り)で[行](い)く。";

    target.examples = [
        { "word": "一番", "reading": "いちばん", "mean": "가장, 제일 (음독)" },
        { "word": "一緒", "reading": "いっしょ", "mean": "함께, 같이 (음독 - 촉음)" },
        { "word": "一人", "reading": "ひとり", "mean": "한 사람 (훈독)" },
        { "word": "一つ", "reading": "ひとつ", "mean": "한 개 (훈독 - 수량 세기)" }
    ];
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed 一 (2) with 2 ON and 2 KUN entries as promised.');
