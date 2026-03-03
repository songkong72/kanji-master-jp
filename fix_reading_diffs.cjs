const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Fix for ID 11 열 십(十)
const t11 = data.find(d => d.id === 11);
if (t11) {
    t11.kun_reading = "とお / とおか";
    t11.kun_sentence = [
        { "text": "[十](とお)の[指](ゆび)을[折](お)る。", "mean": "열 손가락을 꼽다." },
        { "text": "[十日](とおか)の[旅](りょ)[行](こう)。", "mean": "열흘 동안의 여행." }
    ];
    // Fix Korean
    t11.kun_sentence[0].text = "[十](とお)の[指](ゆび)を[折](お)る。";
}

// Fix for ID 10 아홉 구(九)
const t10 = data.find(d => d.id === 10);
if (t10) {
    t10.on_sentence = [
        { "text": "[九](く)[月](がつ)に[始](はじ)まる。", "mean": "9월에 시작하다." },
        { "text": "[九](きゅう)[州](しゅう)へ[行](い)く。", "mean": "큐슈에 가다." }
    ];
    t10.kun_sentence = [
        { "text": "[九](ここの)[つ]あります。", "mean": "아홉 개 있습니다." },
        { "text": "[九日](ここのか)に[帰](かえ)る。", "mean": "9일에 돌아오다." }
    ];
}

// Global script to find cases where reading contains a '.' and ensure the sentence reflects it accurately
data.forEach(d => {
    const kuns = (d.kun_reading || "").split(/[、/]+/).map(r => r.trim()).filter(r => r && r !== '-');
    if (kuns.length > 1 && Array.isArray(d.kun_sentence)) {
        kuns.forEach((k, idx) => {
            if (d.kun_sentence[idx]) {
                const parts = k.split('.'); // [base, okuri]
                if (parts.length > 1) {
                    const full = parts.join('');
                    // If target is 十 and reading is とお.か, we should use [十日](とおか) or at least [十か](とおか)
                    // But for verbs like [行](い)く, it's already divided correctly.

                    // The core issue reported: Second card's reading text was 'とお' instead of 'とおか'.
                    // So we must update the reading in the ruby.
                    const s = d.kun_sentence[idx];
                    const match = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
                    if (match && match[1] === d.kanji) {
                        if (match[2] !== full && full.startsWith(match[2])) {
                            // Fix its reading to the full one
                            s.text = s.text.replace(`[${match[1]}](${match[2]})`, `[${match[1]}](${full})`);
                        }
                    }
                }
            }
        });
    }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed reading/example differences globally.');
