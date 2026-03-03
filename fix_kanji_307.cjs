const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 307); // 振
if (target) {
    target.on_reading = "シン";
    target.kun_reading = "ふ.る/ふ.れる";

    target.on_sentence = {
        "text": "[振](しん)[動](どう)が[激](はげ)しい。",
        "mean": "진동이 격렬하다."
    };

    target.kun_sentence = [
        {
            "text": "[手](て)を[振](ふ)る。",
            "mean": "손을 흔들다."
        },
        {
            "text": "[振](ふ)り[子](こ)가 [振](ふ)れる。",
            "mean": "진자가 흔들리다."
        }
    ];
    // Internal fix for kor char
    target.kun_sentence[1].text = "[振](ふ)り[子](こ)が[振](ふ)れる。";

    target.examples = [
        { "word": "振動", "reading": "しんどう", "mean": "진동 (음독)" },
        { "word": "不振", "reading": "ふしん", "mean": "부진 (음독)" },
        { "word": "振る", "reading": "ふる", "mean": "흔들다, 휘두르다 (훈독)" },
        { "word": "振れる", "reading": "ふれる", "mean": "흔들리다, 쏠리다 (훈독)" }
    ];

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed 振 (307) - Target kanji only color and proper kun alignment.');
}
