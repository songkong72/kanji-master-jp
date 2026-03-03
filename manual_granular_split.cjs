const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

// Common N1/N2 compounds found in audit
const manualMap = {
    "形骸化": "[形](けい)[骸](がい)[化](か)",
    "骨髄": "[骨](こつ)[髄](ずい)",
    "傲慢": "[傲](ごう)[慢](まん)",
    "儒教": "[儒](じゅ)[教](きょう)",
    "代償": "[代](だい)[償](しょう)",
    "傭兵": "[傭](よう)[兵](へい)",
    "傑작": "[傑](けっ)[作](さく)", // fix my own typo in prompt
    "傑作": "[傑](けっ)[作](さく)",
    "僅差": "[僅](きん)[差](さ)",
    "想像": "[想](そう)[像](ぞう)",
    "同伴": "[同](どう)[伴](はん)",
    "補佐": "[補](ほ)[佐](さ)",
    "合併": "[合](がっ)[併](ぺい)",
    "同僚": "[同](どう)[僚](りょう)",
    "虚偽": "[虚](きょ)[偽](ぎ)",
    "儀式": "[儀](ぎ)[式](しき)",
    "仙人": "[仙](せん)[인](にん)",
    "仙人": "[仙](せん)[人](にん)",
    "脱兎": "[脱](だっ)[兎](と)",
    "野兎": "[野](の)[兎](うさぎ)",
    "規範": "[規](き)[范](はん)",
    "防禦": "[防](ぼう)[禦](ぎょ)",
    "堕落": "[堕](だ)[落](らく)",
    "四肢": "[四](し)[肢](し)"
};

let count = 0;
data.forEach(d => {
    if (d.category !== 'N1' && d.category !== 'N2') return;

    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const original = s.text;

        for (const [key, value] of Object.entries(manualMap)) {
            const regex = new RegExp('\\[' + key + '\\]\\(.*?\\)', 'g');
            s.text = s.text.replace(regex, value);
        }

        if (s.text !== original) count++;
    });
});

// Final check for '賂' target missing
const ro = data.find(k => k.kanji === '賂');
if (ro) {
    ro.kun_sentence.text = "この[賂](ろ)という[漢字](かんじ)는 [通](つう)じょう[訓](くん)[読](どく)では[使](つか)われません。".replace('는', 'は');
}

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Manual granularized applied to ${count} entries.`);
