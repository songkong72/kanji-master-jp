const fs = require('fs');

const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

const t11 = data.find(d => d.id === 11);
if (t11) {
    t11.on_reading = "ジュ우 / ジッ / ジュッ";
    t11.on_sentence = [
        { "text": "[十](じゅう)[月](がつ)に[入](はい)る。", "mean": "10월로 접어들다." },
        { "text": "[十](じっ)[回](かい)[連](れん)[続](ぞく)で[勝](か)つ。", "mean": "10회 연속으로 이기다." }
    ];
    t11.kun_reading = "とお / と";
    t11.kun_sentence = [
        { "text": "[十](とお)의 [指](ゆび)을 [折](お)る。", "mean": "열 손가락을 꼽다." },
        { "text": "[二十](はた)[日](か)。", "mean": "20일 (하타카 - '토' 발음의 흔적)." }
    ];
    // Fix Korean
    t11.kun_sentence[0].text = "[十](とお)の[指](ゆび)を[折](어)る。";
    t11.kun_sentence[0].text = t11.kun_sentence[0].text.replace('어', 'お');

    t11.examples = [
        { "word": "十月", "reading": "じゅうがつ", "mean": "시월 (음독)" },
        { "word": "十回", "reading": "じっかい", "mean": "열 번, 10회 (음독 - 촉음 변형)" },
        { "word": "十日間", "reading": "とおかかん", "mean": "열흘 동안 (훈독)" },
        { "word": "二十歳", "reading": "은ちは", "mean": "스무 살 (특수 발음)" }
    ];
    t11.examples[3].reading = "はたち";
    t11.examples[3].mean = "스무 살 (특수 발음)";
}

// Global cleanup: deduplicate header readings and remove '.' parts
data.forEach(d => {
    const clean = (str) => {
        if (!str || str === '-') return "-";
        const unique = [];
        str.split(/[、/]+/).forEach(p => {
            const base = p.split('.')[0].trim();
            if (!unique.includes(base)) unique.push(base);
        });
        return unique.join(' / ');
    };
    d.on_reading = clean(d.on_reading);
    d.kun_reading = clean(d.kun_reading);

    // Ensure text is Japanese only
    const purge = s => { if (s && s.text) s.text = s.text.replace(/[가-힣]/g, '').trim(); };
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (Array.isArray(s)) s.forEach(purge);
        else purge(s);
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));
console.log('Final Polish Applied: Unique base readings only.');
