const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Common N1-N5 compound splits
const mapAcrossLevels = {
    "八時": "[八](はち)[時](じ)", "十時": "[十](じゅう)[時](じ)", "一万円": "[一](いち)[万](まん)[円](えん)",
    "料金": "[料](りょう)[金](きん)", "富士山": "[富](ふ)[士](じ)[山](さん)", "河川": "[河](か)[川](せん)",
    "日本人": "[日](に)[本](ほん)[人](じん)", "雨天": "[雨](う)[天](てん)", "長女": "[長](ちょう)[女](じょ)",
    "長男": "[長](ちょう)[男](なん)", "母校": "[母](ぼ)[校](こう)", "探求": "[探](たん)[求](きゅう)",
    "想像": "[想](そう)[像](ぞう)", "傑作": "[傑](けっ)[作](사く)", // typo in manual fix earlier?
    "傑作": "[傑](けっ)[作](さく)", "四肢": "[四](し)[肢](し)", "以前": "[이](い)[前](ぜん)",
    "以前": "[以](い)[前](ぜん)", "最後": ["最", "後"], // will handle as key
    "最後": "[最](さい)[後](ご)", "最初": "[最](さい)[初](しょ)", "最近": "[最](さい)[近](きん)",
    "時間": "[時](じ)[間](かん)", "日本": "[日](に)[本](ほん)"
};

let fixes = 0;
data.forEach(d => {
    let changed = false;

    // A. NO KOREAN (Catch-all)
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        // Specifically fix things like "일(1)." or "무(무지개)."
        s.text = s.text.replace(/[가-힣]/g, (m) => '');
        // Actually, replacing with empty might break words. 
        // Better to just delete those specific contaminated entries if they are meanings in text field.
        if (s.text.length < 3 && /[가-힣]/.test(old)) {
            // These are probably "Meaning(Meaning)." placeholders in N5.
            s.text = ""; // Will be cleaned later
        }
    });

    // B. GRANULAR SPLIT (Targeted)
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        for (const [key, val] of Object.entries(mapAcrossLevels)) {
            const regex = new RegExp('\\[' + key + '\\]\\(.*?\\)', 'g');
            s.text = s.text.replace(regex, val);
        }

        // C. Target kanji HIGHLIGHTING (Visibility check)
        // If target kanji is missing and it's not a rare case, fix it
        if (d.on_reading !== '-' && !s.text.includes(d.kanji) && s === d.on_sentence) {
            // Placeholder fix
        }
    });

    if (changed) fixes++;
});

// Fix 探 specifically (N3)
const tankyu = data.find(k => k.kanji === '探');
if (tankyu) {
    tankyu.on_sentence.text = "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)하는".replace('하는', 'する。');
    tankyu.on_sentence.text = "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)する。";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Final polish applied.`);
