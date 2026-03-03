const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const getRank = (mean) => {
    if (!mean) return 99; // unknown at bottom
    if (mean.includes('(음독)')) return 1;
    if (mean.includes('(훈독)') && !mean.includes('특수') && !mean.includes('숙자훈')) return 2;
    if (mean.includes('특수') || mean.includes('숙자훈') || mean.includes('예외')) return 3;
    return 4; // unknown
};

let sortCount = 0;

data.forEach(k => {
    if (k.examples && k.examples.length > 1) {
        let isSorted = true;
        for (let i = 0; i < k.examples.length - 1; i++) {
            if (getRank(k.examples[i].mean) > getRank(k.examples[i + 1].mean)) {
                isSorted = false;
                break;
            }
        }

        if (!isSorted) {
            k.examples.sort((a, b) => getRank(a.mean) - getRank(b.mean));
            sortCount++;
        }
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Sorted examples for ${sortCount} kanji entries!`);
