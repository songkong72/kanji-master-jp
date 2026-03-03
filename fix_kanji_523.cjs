const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 523); // 脱
if (target) {
    target.on_sentence = {
        "text": "[刑](けい)[務](む)[所](しょ)から[脱](だっ)[出](しゅつ)する。",
        "mean": "교도소에서 탈출하다."
    };
    target.kun_sentence = [
        {
            "text": "[靴](くつ)を[脱](ぬ)ぐ。",
            "mean": "신발을 벗다."
        },
        {
            "text": "[靴](くつ)가 [脱](ぬ)げる。",
            "mean": "신발이 벗겨지다."
        }
    ];
    // Fix '가' to 'が'
    target.kun_sentence[1].text = "[靴](くつ)が[脱](ぬ)げる。";

    // Also fix examples list to be high quality
    target.examples = [
        { "word": "脱出", "reading": "だっしゅつ", "mean": "탈출 (음독)" },
        { "word": "脱衣所", "reading": "だついじょ", "mean": "탈의실 (음독)" },
        { "word": "脱ぐ", "reading": "ぬぐ", "mean": "벗다 (훈독)" },
        { "word": "脱げる", "reading": "ぬげる", "mean": "벗겨지다 (훈독)" }
    ];

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed 脱 (523) with quality sentences matching readings.');
}
