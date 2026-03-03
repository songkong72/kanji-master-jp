import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const fixes = [
    { id: 65, field: 'kun_reading', old: 'ひ가시', new: 'ひが시' },
    { id: 114, field: 'kun_reading', old: '마치', new: 'まち' },
    { id: 710, field: 'kun_reading', old: '나이시로/사게스무', new: 'ないがしろ/さげすむ' },
    { id: 788, field: 'kun_reading', old: '하다ぬぎ', new: 'はだぬぎ' },
    { id: 818, field: 'kun_reading', old: '우라.む', new: 'うら.む' },
    { id: 826, kanji: '拐', ex_word: '유괴', new_word: '誘拐', new_reading: 'ゆうかい' },
    { id: 591, kanji: '肛', ex_word: '항문', new_word: '肛門', new_reading: 'こうもん' },
    { id: 933, kanji: '瀉', ex_word: '瀉혈', new_word: '瀉血', new_reading: 'しゃけつ' },
    { id: 554, kanji: '肺', ex_word: '肺활량', new_word: '肺活量', new_reading: 'はいかつりょう' }
];

fixes.forEach(f => {
    const item = data.find(p => p.id === f.id);
    if (!item) return;

    if (f.field) {
        item[f.field] = f.new;
    } else if (f.ex_word) {
        const ex = item.examples.find(e => e.word.includes(f.ex_word));
        if (ex) {
            ex.word = f.new_word;
            ex.reading = f.new_reading;
            if (!ex.mean.includes('(음독)')) ex.mean += ' (음독)';
        }
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Specific Korean leftovers fixed.');
