const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let results = {
    koreanInText: [],
    koreanInReading: [],
    missingArrayForMultiReading: [],
    missingReadingLabels: [],
    missingMixedExamples: [],
    unsplitRuby: []
};

const hasKorean = (str) => /[가-힣]/.test(str);
const hasUnsplitRuby = (str) => /\[([一-龥]{2,})\]\(([^)]+)\)/.test(str);

data.forEach((entry) => {
    const kanjiInfo = `${entry.id} (${entry.kanji})`;
    // 1. Korean in sentence text or ruby text
    const sentences = [];
    if (entry.on_sentence) {
        if (Array.isArray(entry.on_sentence)) sentences.push(...entry.on_sentence);
        else sentences.push(entry.on_sentence);
    }
    if (entry.kun_sentence) {
        if (Array.isArray(entry.kun_sentence)) sentences.push(...entry.kun_sentence);
        else sentences.push(entry.kun_sentence);
    }

    // Check Korean in sentences
    sentences.forEach((s) => {
        if (s.text) {
            if (hasKorean(s.text)) results.koreanInText.push(kanjiInfo);
            if (hasUnsplitRuby(s.text)) results.unsplitRuby.push(kanjiInfo);
        }
    });

    // Check examples
    if (entry.examples && Array.isArray(entry.examples)) {
        let hasOn = false;
        let hasKun = false;
        let hasMissingLabel = false;

        entry.examples.forEach((ex) => {
            if (hasKorean(ex.word) || (ex.reading && hasKorean(ex.reading))) {
                results.koreanInReading.push(kanjiInfo);
            }
            if (hasUnsplitRuby(ex.word)) {
                results.unsplitRuby.push(kanjiInfo);
            }

            const mean = ex.mean || '';
            if (mean.includes('(음독)')) hasOn = true;
            if (mean.includes('(훈독)')) hasKun = true;
            if (!mean.includes('(음독)') && !mean.includes('(훈독)')) hasMissingLabel = true;
        });

        if (hasMissingLabel) results.missingReadingLabels.push(kanjiInfo);

        const hasValidOn = entry.on_reading && entry.on_reading !== '-';
        const hasValidKun = entry.kun_reading && entry.kun_reading !== '-';

        if (hasValidOn && hasValidKun) {
            if (!hasOn || !hasKun) {
                // Exclude if it's already there to avoid duplicates
                if (!results.missingMixedExamples.includes(kanjiInfo)) {
                    results.missingMixedExamples.push(kanjiInfo);
                }
            }
        }
    }

    // Check mutli-reading missing array
    const checkMulti = (reading, sentence) => {
        if (reading && reading !== '-' && reading.includes('/')) {
            if (!Array.isArray(sentence)) {
                if (!results.missingArrayForMultiReading.includes(kanjiInfo)) {
                    results.missingArrayForMultiReading.push(kanjiInfo);
                }
            }
        }
    };
    checkMulti(entry.on_reading, entry.on_sentence);
    checkMulti(entry.kun_reading, entry.kun_sentence);
});

// Deduplicate arrays
for (const key in results) {
    results[key] = [...new Set(results[key])];
}

const stats = {
    koreanInText: results.koreanInText.length,
    koreanInReading: results.koreanInReading.length,
    missingArrayForMultiReading: results.missingArrayForMultiReading.length,
    missingReadingLabels: results.missingReadingLabels.length,
    missingMixedExamples: results.missingMixedExamples.length,
    unsplitRuby: results.unsplitRuby.length
};

console.log(JSON.stringify({ stats, results }, null, 2));
