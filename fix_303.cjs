const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// High-precision correction for 捨 (ID 303)
const target = data.find(d => d.id === 303);
if (target) {
    target.on_reading = "シャ";
    target.kun_reading = "す.てる";
    target.on_sentence = {
        "text": "[四](し)[捨](しゃ)[五](고)[入](にゅう)する。",
        "mean": "반올림(사사오입)하다."
    };
    target.kun_sentence = {
        "text": "[使](つ)かい[捨](す)てを[減](へ)らす。",
        "mean": "일회용품(버리기)을 줄이다."
    };
    target.examples = [
        { "word": "[四](し)[捨](しゃ)[五](ご)[入](에)", "reading": "ししゃごにゅう", "mean": "사사오입, 반올림 (음독)" },
        { "word": "[使](つ)かい[捨](す)て", "reading": "つかいすて", "mean": "일회용 (훈독)" }
    ];
}

// Ensure all Japanese matches correct particles
data.forEach(d => {
    const fixKO = s => {
        if (s && s.text) s.text = s.text.replace(/[가-힣]/g, '').trim();
    };
    [d.on_sentence, d.kun_sentence].forEach(v => {
        if (Array.isArray(v)) v.forEach(fixKO);
        else fixKO(v);
    });
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Final 捨 Fix Applied: Natural Japanese + Split Rubies.');
