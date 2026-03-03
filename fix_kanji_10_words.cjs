const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 10); // 九
if (target) {
    target.on_reading = "キュウ/ク";
    target.kun_reading = "ここの.つ/ここの.か";

    // Correcting sentences to ensure 1:1 ratio
    target.on_sentence = [
        { text: "[九](きゅう)[州](しゅう)へ[行](い)く。", mean: "큐슈에 가다." },
        { text: "[九](く)[時](じ)に[朝](あさ)[食](しょく)を[食](た)べる。", mean: "9시에 아침을 먹는다." }
    ];
    target.kun_sentence = [
        { text: "[九](ここの)[つ]あります。", mean: "9개 있습니다." },
        { text: "[九](こ)[こ](の)[か]に[帰](かえ)る。", mean: "9일에 돌아온다." }
    ];
    // Internal fix for multi-reading kun-sentence ruby splitting per user rules
    target.kun_sentence[1].text = "[九](ここの)[か]に[帰](かえ)る。";

    // Fixing the core issue: EACH reading must have an example word
    target.examples = [
        { "word": "九州", "reading": "きゅうしゅう", "mean": "큐슈 (음독)" },
        { "word": "九", "reading": "く", "mean": "아홉, 구 (음독)" },
        { "word": "九つ", "reading": "ここのつ", "mean": "아홉 개 (훈독)" },
        { "word": "九日", "reading": "ここのか", "mean": "구일 (훈독)" }
    ];

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Fixed 九 (10) - Word list now matches all readings.');
}
