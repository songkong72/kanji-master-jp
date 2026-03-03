const fs = require('fs');
let md = fs.readFileSync('.agents/workflows/kanji_data_guidelines.md', 'utf8');
const newRule = '\n#### 2-3. 의미에 따른 정확한 읽기(히라가나) 매칭\n- 동일한 한자 단어라도 **의미(뜻)에 따라 히라가나 읽기가 달라지는 경우**가 있습니다. 한국어 단어 뜻(`mean`)과 일본어 읽기(`reading`)가 서로 모순되지 않고 정확히 매칭되는지 확인해야 합니다.\n- 예시: `一日`의 경우\n  - 의미가 **"하루"**일 때는 `いちにち` (음독)\n  - 의미가 **"초하루(매월 1일)"**일 때는 `ついたち` (훈독/특수 읽기)\n- 따라서 `word`, `reading`, `mean` 세 가지 필드가 문맥상 일치하도록 신중하게 기재해야 합니다.\n\n';
if (!md.includes('2-3. 의미에 따른 정확한 읽기(히라가나) 매칭')) {
    md = md.replace('### 3. 루비 표기', newRule + '### 3. 루비 표기');
    fs.writeFileSync('.agents/workflows/kanji_data_guidelines.md', md, 'utf8');
    console.log('Guideline updated.');
} else {
    console.log('Already updated.');
}
