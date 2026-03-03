const fs = require('fs');
const kanjiPath = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

let removedCount = 0;
let fixedVerbsCount = 0;

// Korean verb endings that are improperly stored as modifiers (관형어형)
// e.g., "버릴" -> "버리다", "뉘우칠" -> "뉘우치다", "어그러질" -> "어그러지다", "깨달을" -> "깨닫다" (Hard to regex properly without mapping, but we can do simple ones)
// Rather than risking bad regex, we target dummy examples where word === kanji directly.

data.forEach(d => {
    // 1. Remove meaningless single-kanji examples that are just verb stems.
    // Using an explicit rule: if it's the exact kanji, and the meaning ends with a 'ㄹ' or '은/는' right before " (음독)"/" (훈독)"
    // Example: "뉘우칠 (음독)", "번뇌할 (음독)", "버릴 (음독)", "잠잘 (음독)"
    const originalExampleLength = d.examples.length;

    d.examples = d.examples.filter(ex => {
        if (ex.word === d.kanji) {
            // Check if it's a dummy verb/adjective stem
            if (/(할|일|될|칠|를|을|는|은|러질|잘|품을|깨달을|오를)[ \t]*\(/.test(ex.mean)) {
                removedCount++;
                return false; // delete it
            }

            // Also, if the meaning is exactly the Hanja meaning (which usually ends in '할', '일')
            // Let's also check if meaning matches without ' ' + (음독).
            const plainMean = ex.mean.replace(/\s*\([^)]+\)$/, '').trim();
            if ((d.meaning || '').includes(plainMean) && plainMean.match(/[가-힣]*[ㄹ은는을를]/)) {
                removedCount++;
                return false;
            }
        }
        return true; // Keep others
    });

    // 2. Fix verb/adjective translations ending in 'る'(ru), 'う'(u), 'く'(ku), 'す'(su), 'む'(mu), etc.
    d.examples.forEach(ex => {
        if (/[るうくすむつぬぶ]$/.test(ex.word)) {
            // If it's a Japanese verb, ensure the Korean ends naturally where possible.
            // E.g., "(~을) 버릴 (훈독)" -> "??" Let's just catch some highly obvious ones we can confidently replace
            // This part is delicate. We can just replace "할 (" -> "하다 (", "칠 (" -> "치다 (" for "る" ending words.
            let newMean = ex.mean;
            newMean = newMean.replace(/할\s*\(/, '하다 (');
            newMean = newMean.replace(/일\s*\(/, '이다 (');
            newMean = newMean.replace(/칠\s*\(/, '치다 (');
            newMean = newMean.replace(/될\s*\(/, '되다 (');
            newMean = newMean.replace(/버릴\s*\(/, '버리다 (');

            if (newMean !== ex.mean) {
                fixedVerbsCount++;
                ex.mean = newMean;
            }
        }
    });
});

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2));

console.log(`Removed ${removedCount} dummy single-kanji verb stems.`);
console.log(`Fixed Korean endings for ${fixedVerbsCount} Japanese verbs.`);
