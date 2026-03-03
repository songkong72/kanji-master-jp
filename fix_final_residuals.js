import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// ID 302 (探)
const p302 = data.find(p => p.id === 302);
if (p302) {
    p302.kun_sentence[1].text = "[洞](ほら)[穴](あな)の[奥](おく)を[探](さぐ)る。";
}

// ID 530 (肺)
const p530 = data.find(p => p.id === 530);
if (p530) {
    p530.examples[1].word = "肺活量";
    p530.examples[1].reading = "はいかつりょう";
}

// ID 541 (肛)
const p541 = data.find(p => p.id === 541);
if (p541) {
    p541.examples[0].word = "肛門";
    p541.examples[0].reading = "こうもん";
}

// ID 579 (瀉)
const p579 = data.find(p => p.id === 579);
if (p579) {
    p579.examples[0].word = "瀉血";
    p579.examples[0].reading = "しゃけつ";
}

// ID 580 (漑)
const p580 = data.find(p => p.id === 580);
if (p580) {
    p580.examples[0].word = "灌漑";
    p580.examples[0].reading = "かんがい";
}

// ID 581 (灌)
const p581 = data.find(p => p.id === 581);
if (p581) {
    p581.examples[1].word = "灌木";
    p581.examples[1].reading = "かんぼく";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed specific residuals in 302, 530, 541, 579, 580, 581.');
