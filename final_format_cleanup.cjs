const fs = require('fs');

let data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

data.forEach(d => {
    // 1. Clean all Korean from examples' readings and word
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading) ex.reading = ex.reading.replace(/[가-힣\s]/g, '').trim();
            if (ex.word) ex.word = ex.word.replace(/[가-힣]/g, '').trim();

            // If extracting made logic grab entire sentences, trim it down.
            if (ex.word && ex.word.length > 15) {
                // Keep only the first valid ruby block or kanji
                const match = ex.word.match(/\[[^\]]+\]\([^)]+\)/);
                if (match) {
                    ex.word = match[0];
                    ex.reading = match[0].replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2');
                    ex.mean = '관련어 ' + (ex.mean.includes('(훈독)') ? '(훈독)' : '(음독)');
                }
            }
        });

        // Ensure no duplicate "(음독) (음독)"
        d.examples.forEach(ex => {
            ex.mean = ex.mean.replace(/\(음독\)\s*\(음독\)/g, '(음독)');
            ex.mean = ex.mean.replace(/\(훈독\)\s*\(훈독\)/g, '(훈독)');
        });
    }

    // 2. Clean sentences from Korean where they should only be Japanese
    const cleanSent = s => {
        if (!s) return;
        if (s.text) s.text = s.text.replace(/[가-힣]/g, '').trim();
    };
    if (Array.isArray(d.on_sentence)) d.on_sentence.forEach(cleanSent);
    else cleanSent(d.on_sentence);

    if (Array.isArray(d.kun_sentence)) d.kun_sentence.forEach(cleanSent);
    else cleanSent(d.kun_sentence);

});

fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Final cleanup completed: Stripped rogue Korean characters from readings/texts, fixed long extracted sentence chunks.');
