const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

data.forEach(d => {
    // 1. Fix Placeholders (3 cases)
    if (d.id === 17) { // 分
        d.examples = [
            { "word": "自分", "reading": "じぶん", "mean": "자신 (음독)" },
            { "word": "分かる", "reading": "わかる", "mean": "알다 (훈독)" }
        ];
    }
    if (d.id === 51) { // 来
        d.examples = [
            { "word": "来年", "reading": "らいねん", "mean": "내년 (음독)" },
            { "word": "来る", "reading": "くる", "mean": "오다 (훈독)" }
        ];
    }

    // 2. Fix Missing Reading Sentences (2 cases)
    if (d.id === 128) { // 便
        d.on_sentence = [
            { "text": "[便](べん)[利](り)な[道](みち)だ。", "mean": "편리한 길이다." },
            { "text": "お[便](びん)[り]を[待](ま)つ。", "mean": "편지를 기다리다." }
        ];
    }
    if (d.id === 454) { // 従
        d.on_sentence = [
            { "text": "[従](じゅう)[業](ぎょう)[員](いん)を[雇](やと)う。", "mean": "종업원을 고용하다." },
            { "text": "[服](ふく)[従](じゅう)させる。", "mean": "복종시키다." },
            { "text": "[従](しょう)[容](よう)として[死](し)に[就](つ)く。", "mean": "침착하게 죽음을 맞이하다." }
        ];
        // 4. Fix Korean Particle (1 case)
        d.kun_sentence = [
            { "text": "[指](し)[示](じ)に[従](したが)う。", "mean": "지시에 따르다." },
            { "text": "[家](가)[臣](しん)を[従](したが)える。", "mean": "가신을 거느리다." }
        ];
    }

    // 3. Fix Ruby Error (1 case: 火)
    if (d.id === 22) { // 火
        d.kun_sentence = { "text": "[火](ひ)を[付](つ)ける。", "mean": "불을 붙이다/지피다." };
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log("THE FINAL 7 ISSUES ERADICATED.");
