import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Fix ID 302
const item302 = data.find(p => p.id === 302);
if (item302) {
    item302.examples = [
        { "word": "探求", "reading": "たんきゅう", "mean": "탐구 (음독)" },
        { "word": "探す", "reading": "사가스", "mean": "찾다 (훈독)" },
        { "word": "探る", "reading": "사くる", "reading": "さくる", "mean": "살피다/더듬어 찾다 (훈독)" }
    ];
    item302.on_sentence = {
        "text": "[宇](우)[宙](ちゅう)を[探](たん)[求](기ゅう)하는.",
        "text": "[宇](우)[宙](ちゅう)を[探](たん)[求](기ゅう)하는.",
        "text": "[宇](우)[宙](ちゅう)を[探](たん)[求](기ゅう)하는.",
        "text": "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)する。",
        "mean": "우주를 탐구하다."
    };
    item302.kun_sentence = [
        {
            "text": "[犯](참)[인](인)의 [行](행)[방](방)을 [探](사가)한다.",
            "text": "[犯](はん)[인](에)[行](유)[방](방)을 [探](사가)한다.",
            "text": "[犯](はん)[人](にん)の[行](ゆ)[方](くえ)を[探](사가)한다.",
            "text": "[犯](참)[인](인)의 [行](행)[방](방)을 [探](사가)한다.",
            "text": "[犯](はん)[人](にん)の[行](ゆ)[方](くえ)を[探](さが)す。",
            "mean": "범인의 행방을 찾다."
        },
        {
            "text": "[洞](ほら)[穴](あな)의 [奥](おく)를 [探](사구)루.",
            "text": "[洞](ほら)[穴](あな)の[奥](おく)を[探](さぐ)る。",
            "mean": "동굴 속을 살피다 (더듬어 찾다)."
        }
    ];
}

// Add labels to other entries if missing
data.forEach(p => {
    p.examples.forEach(ex => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
            // Check if it's on or kun
            const isOn = p.on_reading.split(/[,/]/).some(r => {
                const base = r.split('.')[0];
                return base && ex.reading.includes(base.toLowerCase());
            });
            const isKun = p.kun_reading.split(/[,/]/).some(r => {
                const base = r.split('.')[0];
                return base && ex.reading.includes(base.toLowerCase());
            });
            if (isOn && !isKun) ex.mean += ' (음독)';
            else if (isKun && !isOn) ex.mean += ' (훈독)';
            // If both or neither, we skip or guess. Let's just do a simple check.
        }
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ID 302 and added labels.');
