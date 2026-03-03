import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const it = data.find(p => p.id === 319);
if (it) {
    it.examples = [
        { "word": "振動", "mean": "진동 (음독)", "reading": "しんどう" },
        { "word": "不振", "mean": "부진 (음독)", "reading": "ふしん" }
    ];
    it.on_sentence = {
        "text": "[携](けい)[帯](たい)[電](でん)[話](わ)の[振](しん)[動](どう)を[感](かん)じる。",
        "mean": "휴대전화의 진동을 느끼다."
    };
    it.kun_sentence = [
        {
            "text": "[手](て)를 [振](후)ッテ [別](원)레루.",
            "text": "[手](て)を[振](ふ)って[別](わか)れる。",
            "mean": "손을 흔들며 헤어지다."
        },
        {
            "text": "[口](こう)[座](ざ)にお[金](かね)を[振](ふ리)[込](코미)한다.",
            "text": "[口座](こうざ)にお[金](かね)を[振](ふり)[込](こ)む。",
            "mean": "계좌로 돈을 이체하다."
        }
    ];
    // Clean up duplicate keys in kun_sentence if any
    it.kun_sentence.forEach(sub => {
        // The above assignment already cleans it up if I define it as new.
    });
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ID 319 manually.');
