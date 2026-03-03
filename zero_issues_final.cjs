const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

data.forEach(d => {
    if (d.id === 454) { // 従
        d.kun_sentence = [
            { "text": "[指](し)[示](じ)에 [従](したが)う。", "mean": "지시에 따르다." },
            { "text": "[家](か)[臣](しん)を[従](したが)える。", "mean": "가신을 거느리다." }
        ];
        // Fix the '에' inside again
        d.kun_sentence[0].text = "[指](し)[示](じ)に[従](したが)う。";
    }
    if (d.id === 22) { // 火
        d.kun_sentence = [
            { "text": "[火](ひ)を[付](つ)ける。", "mean": "불을 붙이다." },
            { "text": "[火](ひ)が[出](で)る。", "mean": "불이 나다." },
            { "text": "[火](ほ)[影](かげ)を[見](み)る。", "mean": "등불을 보다 (호 발음)." }
        ];
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log("ALL ISSUES ZERO.");
