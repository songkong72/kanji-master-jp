const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 11); // 十
if (target) {
    target.on_reading = "ジュウ";
    target.kun_reading = "とお/とお.か";

    target.on_sentence = {
        text: "[十](じゅう)[月](がつ)に[入](はい)る。",
        mean: "10월로 접어들다."
    };

    target.kun_sentence = [
        {
            text: "[十](とお)の[指](ゆび)を[折](お)る。",
            mean: "열 손가락을 꼽다."
        },
        {
            text: "[十](とお)[日](か)[間](かん)의 [旅](りょ)[行](こう)。",
            mean: "열흘 동안의 여행."
        }
    ];
    // Fix Korean in text
    target.kun_sentence[1].text = "[十](とお)[日](か)[間](かん)の[旅](りょ)[行](こう)。";

    target.examples = [
        { "word": "十", "reading": "じゅう", "mean": "열, 십 (음독)" },
        { "word": "十月", "reading": "じゅうがつ", "mean": "시월 (음독)" },
        { "word": "十", "reading": "とお", "mean": "열 (훈독)" },
        { "word": "十日", "reading": "とおか", "mean": "십일, 열흘 (훈독)" }
    ];

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed 十 (11) - Kun sentences now match readings.');
}
