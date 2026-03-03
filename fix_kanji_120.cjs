const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 120);
if (target) {
    target.kun_reading = 'の.る/の.せる';
    target.examples = [
        { "word": "乗車", "reading": "じょうしゃ", "mean": "승차 (음독)" },
        { "word": "乗り物", "reading": "のりもの", "mean": "탈것 (훈독)" },
        { "word": "乗る", "reading": "의.る", "mean": "타다 (훈독)" }
    ];
    // Wait, correct the reading for third example to hire
    target.examples[2].reading = 'のる';

    target.on_sentence = {
        "text": "[乗](じょう)[車](しゃ)券(けん)を[買](か)う。",
        "mean": "승차권을 사다."
    };
    target.kun_sentence = [
        {
            "text": "[電](でん)[車](しゃ)に[乗](の)る。",
            "mean": "전철을 타다."
        },
        {
            "text": "[荷](に)[物](もつ)을 [車](くるま)에 [乗](の)せる。",
            "mean": "짐을 차에 싣다."
        }
    ];
    // Guide 89: No korean in ruby/text. The '을' is inside the text string but outside the [..](..) blocks.
    // Wait, I should make the sentence fully Japanese. 
    target.kun_sentence[1].text = "[荷](に)[物](もつ)を[車](くるま)に[乗](の)せる。";
    target.kun_sentence[1].mean = "짐을 차에 싣다.";

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed 乗 (120) with quality sentences.');
}
