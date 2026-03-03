const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

const compoundSplits = {
    "日本": ["に", "ほん"],
    "日本語": ["에", "ほん", "ご"], // Wait, Ni-hon-go
    "日本語": ["に", "ほん", "ご"],
    "毎日": ["まい", "にち"],
    "曜日": ["よう", "び"],
    "今日": ["き", "ょう"],
    "勉強": ["べん", "きょう"],
    "月曜日": ["げつ", "よう", "び"],
    "日曜日": ["にち", "よう", "び"],
    "火曜日": ["か", "よう", "び"],
    "水曜日": ["すい", "よう", "び"],
    "木曜日": ["もく", "よう", "び"],
    "金曜日": ["きん", "よう", "び"],
    "土曜日": ["ど", "よう", "비"], // wait, '비'
    "土曜日": ["ど", "よう", "び"],
    "家族": ["か", "ぞく"],
    "学校": ["がっ", "こう"],
    "先生": ["せん", "せい"],
    "友達": ["とも", "だち"],
    "名前": ["な", "まえ"],
    "時計": ["と", "けい"],
    "一番": ["いち", "ばん"],
    "十分": ["じゅう", "ぶん"],
    "時間": ["じ", "かん"],
    "以前": ["い", "ぜん"],
    "最後": ["さい", "ご"],
    "九州": ["きゅう", "しゅう"]
};

let fixCount = 0;

data.forEach(d => {
    let changed = false;

    // 1. Label Correction (Improved)
    if (d.examples) {
        d.examples.forEach(ex => {
            const oldMean = ex.mean;
            const cleanMean = ex.mean.replace(/\s*\([\)\w\s가-힣]+\)$/, '').trim();

            const onPrefixes = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => k2h(r.trim().toLowerCase()).split('.')[0]);
            const kunPrefixes = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim().toLowerCase().split('.')[0]);

            let isOn = onPrefixes.some(p => ex.reading.startsWith(p));
            let isKun = kunPrefixes.some(p => ex.reading.startsWith(p));

            let suffix = '';
            if (isOn && !isKun) suffix = ' (음독)';
            else if (isKun && !isOn) suffix = ' (훈독)';
            else if (isOn && isKun) suffix = ' (음/훈독)';
            else suffix = ' (음독)'; // Default

            ex.mean = `${cleanMean}${suffix}`;
            if (ex.mean !== oldMean) changed = true;
        });
    }

    // 2. Fix Korean in readings
    const korMap = { '시': 'し', '나': 'な', '무': 'む', '의': 'の', '카': 'か', '오': 'お', '루': 'る' };
    ['on_reading', 'kun_reading'].forEach(field => {
        if (/[가-힣]/.test(d[field])) {
            d[field] = d[field].replace(/[가-힣]/g, m => korMap[m] || m);
            changed = true;
        }
    });

    // 3. Ruby Splitting (Advanced)
    const rubySplit = (text) => {
        if (!text) return text;
        return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
            if (kanjis.length > 1) {
                // Heuristic 1: If it's the target kanji itself but has something like [四肢](しし)
                // Actually the guideline says "split multi-kanji blocks".

                // Case 1: Manual split
                if (compoundSplits[kanjis]) {
                    const reads = compoundSplits[kanjis];
                    if (reads.length === kanjis.length) {
                        return kanjis.split('').map((k, i) => `[${k}](${reads[i]})`).join('');
                    }
                }

                // Case 2: One-to-one length match
                if (kanjis.length === read.length) {
                    return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');
                }

                // Case 3: Target kanji split (heuristic)
                // If kanjis = AB, read = abc, and d.kanji = A, and on_reading starts with a...
                // This is risky. Let's stick to obvious ones.
            }
            return full;
        });
    };

    const processSentence = (s) => {
        if (!s) return;
        const process = (item) => {
            const oldT = item.text;
            item.text = rubySplit(item.text);
            // Fix Korean Particles in sentences (common OCR errors)
            const particleMap = { '에': 'に', '가': 'が', '은': 'は', '는': 'は', '을': 'を', '를': 'を' };
            // Note: This is DANGEROUS but user said "fix everything". I'll be conservative.
            // Only replace Korean outside of [ ] and ( )
            item.text = item.text.replace(/([^\[\]\(\)\s])([가-힣])([^\[\]\(\)\s]*)/g, (f, before, kor, after) => {
                if (particleMap[kor]) return before + particleMap[kor] + after;
                return f;
            });
            if (item.text !== oldT) changed = true;
        };

        if (Array.isArray(s)) s.forEach(process);
        else process(s);
    };
    processSentence(d.on_sentence);
    processSentence(d.kun_sentence);

    if (changed) fixCount++;
});

// 4. Force fix for ID 5 (四) and ID 10 (九) as examples
const id5 = data.find(k => k.id === 5);
if (id5) {
    id5.kun_sentence = [
        { text: "[四](よっ)つあります。", mean: "네 개 있습니다." },
        { text: "「[今](い)[日](ま)、[四](よん)[時](じ)に[来](く)る。」", mean: "오늘, 4시에 온다." }
    ];
    id5.on_reading = "シ";
    if (id5.examples.length < 2) {
        // ensure diversity
    }
}

const id10 = data.find(k => k.id === 10);
if (id10) {
    id10.on_sentence = [
        { text: "[九](く)[時](じ)に[朝](あさ)[食](しょく)を[食](た)べる。", mean: "9시에 아침을 먹는다." },
        { text: "[九](きゅう)[州](しゅう)へ[行](い)く。", mean: "큐슈에 가다." }
    ];
    id10.kun_sentence = [
        { text: "[九](ここの)[つ]あります。", mean: "9개 있습니다." },
        { text: "[九](ここの)[日](か)に[帰](かえ)る。", mean: "9일에 돌아온다." }
    ];
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Deep fixed ${fixCount} entries.`);
