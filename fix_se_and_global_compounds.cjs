const fs = require('fs');
const file = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const target = data.find(d => d.id === 118); // 世
if (target) {
    target.on_reading = "セイ / セ";
    target.kun_reading = "よ";

    target.on_sentence = [
        { "text": "[21](にじゅういち)[世](せい)[紀](き)に[入](はい)る。", "mean": "21세기에 접어들다." },
        { "text": "[世](せ)[話](わ)を[焼](や)く。", "mean": "참견하다 (도움을 주다)." }
    ];
    target.kun_sentence = {
        "text": "[世](よ)の[中](なか)を[知](し)る。",
        "mean": "세상 물정을 알다."
    };

    target.examples = [
        { "word": "世紀", "reading": "세이키", "mean": "세기 (음독)" },
        { "word": "世話", "reading": "세와", "mean": "도움, 보살핌 (음독)" },
        { "word": "世の中", "reading": "요노나카", "mean": "세상, 사회 (훈독)" }
    ];
    // Fix readings
    target.examples[0].reading = "せいき";
    target.examples[1].reading = "せわ";
    target.examples[2].reading = "よのなか";
}

// Global cleanup: Ensure no example word is JUST the study kanji
data.forEach(d => {
    d.examples = d.examples.map(ex => {
        // If word is just the kanji, try to find a better one from the sentences or existing data
        if (ex.word === d.kanji || ex.word === `[${d.kanji}](${ex.reading})`) {
            // Find first compound in sentences that uses this reading
            const allSents = [
                ...(Array.isArray(d.on_sentence) ? d.on_sentence : [d.on_sentence]),
                ...(Array.isArray(d.kun_sentence) ? d.kun_sentence : [d.kun_sentence])
            ].filter(s => s && s.text);

            for (const s of allSents) {
                const matches = s.text.match(/\[([^\]]+)\]\(([^)]+)\)/g);
                if (matches) {
                    for (const m of matches) {
                        const innerMatch = m.match(/\[([^\]]+)\]\(([^)]+)\)/);
                        if (innerMatch && innerMatch[1].length > 1 && innerMatch[1].includes(d.kanji)) {
                            return { word: innerMatch[1], reading: innerMatch[2], mean: s.mean.split(' ')[0] + (ex.mean.includes('음독') ? ' (음독)' : ' (훈독)') };
                        }
                    }
                }
            }
        }
        return ex;
    });

    // Remove duplicates and ensure all words have ruby applied to parts
    const seen = new Set();
    d.examples = d.examples.filter(ex => {
        if (!ex || !ex.word) return false;
        const key = ex.word + ex.reading;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Final Ruby wrapping for all example words
    d.examples.forEach(ex => {
        // Remove existing ruby if any to re-apply correctly
        let plainWord = ex.word.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        // Simple heuristic for 2-kanji words: split reading in half
        if (plainWord.length === 2 && /[\u4e00-\u9faf]{2}/.test(plainWord) && ex.reading.length % 2 === 0) {
            const mid = ex.reading.length / 2;
            ex.word = `[${plainWord[0]}](${ex.reading.substring(0, mid)})[${plainWord[1]}](${ex.reading.substring(mid)})`;
        } else if (plainWord.length === 1 && /[\u4e00-\u9faf]/.test(plainWord)) {
            ex.word = `[${plainWord}](${ex.reading})`;
        }
    });
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed 世 (118) and performed global sweep to remove single-kanji examples.');
