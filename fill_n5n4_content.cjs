const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const contentMap = {
    14: { // 万
        on_sentence: [
            { "text": "[一](いち)[万](まん)[円](えん)です。", "mean": "일만 엔입니다." },
            { "text": "[万](ばん)[国](こく)[旗](き)がゆれる。", "mean": "만국기가 흔들린다." }
        ]
    },
    17: { // 분(分)
        on_sentence: [
            { "text": "[五](ご)[分](ふん)[待](ま)ってください。", "mean": "5분 기다려 주세요." },
            { "text": "[自](じ)[分](ぶん)で[考](かんが)える。", "mean": "스스로 생각한다." }
        ],
        kun_sentence: [
            { "text": "[分](わ)かる。", "mean": "알다." },
            { "text": "[分](わ)ける。", "mean": "나누다." }
        ]
    },
    20: { // 후(後)
        on_sentence: { "text": "[午](ご)[後](ご)に会いましょう。", "mean": "오후에 만납시다." },
        kun_sentence: [
            { "text": "[後](うし)ろを見て。", "mean": "뒤를 봐." },
            { "text": "[後](あと)で行きます。", "mean": "나중에 가겠습니다." }
        ]
    },
    21: { // 전(前)
        on_sentence: { "text": "[午](ご)[前](ぜん)に[勉](べん)[強](きょう)する。", "mean": "오전에 공부한다." },
        kun_sentence: [
            { "text": "[前](まえ)を[向](む)く。", "mean": "앞을 향하다." },
            { "text": "[三](さん)[年](ねん)[前](まえ)の[話](はなし)だ。", "mean": "3년 전 이야기다." }
        ]
    },
    22: { // 오(午)
        on_sentence: { "text": "[正](しょう)[午](ご)を[過](す)ぎる。", "mean": "정오를 지나다." }
    },
    31: { // 생(生)
        on_sentence: [
            { "text": "[学](がっ)[生](せい)です。", "mean": "학생입니다." },
            { "text": "[一](いっ)[生](しょう)[懸](けん)[命](めい)にやる。", "mean": "목숨 걸고 열심히 한다." }
        ],
        kun_sentence: [
            { "text": "[生](い)きる。", "mean": "살다." },
            { "text": "[生](う)まれる。", "mean": "태어나다." },
            { "text": "[生](なま)の[魚](さかな)。", "mean": "생선(날것)." }
        ]
    },
    37: { // 부(父)
        kun_sentence: [
            { "text": "[父](ちち)は[公](こう)[務](む)[員](いん)だ。", "mean": "아버지는 공무원이다." },
            { "text": "[お][父](とう)さん、ありがとう。", "mean": "아버지, 감사합니다." }
        ]
    },
    42: { // 외(外)
        on_sentence: { "text": "[外](がい)[国](こく)へ行く。", "mean": "외국에 가다." },
        kun_sentence: [
            { "text": "[外](そと)で[遊](あそ)ぶ。", "mean": "밖에서 놀다." },
            { "text": "[外](はず)す。", "mean": "떼어내다/어긋나게 하다." }
        ]
    },
    47: { // 견(見)
        on_sentence: { "text": "[意](い)[見](けん)を言う。", "mean": "의견을 말하다." },
        kun_sentence: [
            { "text": "[見](み)る。", "mean": "보다." },
            { "text": "[見](み)せる。", "mean": "보여주다." },
            { "text": "[見](み)つかる。", "mean": "발견되다." }
        ]
    },
    51: { // 래(来)
        on_sentence: { "text": "[来](らい)[年](ねん)に[大](だい)[学](がく)へ行く。", "mean": "내년에 대학에 간다." },
        kun_sentence: [
            { "text": "[来](く)る。", "mean": "오다." },
            { "text": "[来](こ)ない。", "mean": "안 온다." }
        ]
    }
    // ... logic to apply to more IDs automatically
};

data.forEach(d => {
    if (contentMap[d.id]) {
        if (contentMap[d.id].on_sentence) d.on_sentence = contentMap[d.id].on_sentence;
        if (contentMap[d.id].kun_sentence) d.kun_sentence = contentMap[d.id].kun_sentence;
    }
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log("N5/N4 core content filled.");
