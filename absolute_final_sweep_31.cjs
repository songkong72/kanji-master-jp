const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const final31 = {
    "殺虫剤": "[殺](さっ)[虫](ちゅう)[剤](ざい)",
    "掲示板": "[掲](けい)[示](じ)[板](ばん)",
    "被害額": "[被](ひ)[害](がい)[額](がく)",
    "証明書": "[証](しょう)[明](めい)[書](しょ)",
    "戸籍謄本": "[戸](こ)[籍](せき)[謄](とう)[本](ほん)",
    "生活費": "[生](せい)[活](かつ)[費](ひ)",
    "超満員": "[超](ちょう)[満](まん)[員](いん)",
    "警察庁": "[警](けい)[察](사つ)[庁](ちょう)", // fix typo
    "警察庁": "[警](けい)[察](さつ)[庁](ちょう)",
    "甲状腺": "[甲](こう)[状](じょう)[腺](せん)",
    "終着駅": "[終](しゅう)[着](ちゃく)[駅](えき)",
    "横断歩道": "[横](おう)[断](だん)[歩](ほ)[도](どう)", // fix typo
    "横断歩道": "[横](おう)[断](だん)[歩](ほ)[道](どう)",
    "市役所": "[市](し)[役](やく)[所](しょ)",
    "航空便": "[航](こう)[空](くう)[便](びん)",
    "駐車場": "[駐](ちゅう)[車](しゃ)[場](じょう)",
    "多様化": "[多](た)[様](よう)[化](か)",
    "消防署": "[消](しょう)[防](ぼう)[署](しょ)"
};

let fixes = 0;
data.forEach(d => {
    let changed = false;
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            if (kanjis.includes(d.kanji) && kanjis.length > 1) {
                if (final31[kanjis]) return final31[kanjis];
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });
    if (changed) fixes++;
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Final 31 Fix Applied. Fixed ${fixes} items.`);
