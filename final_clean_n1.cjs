const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const updates = {
    "渦": {
        "on_sentence": { "text": "[激](はげ)しい[渦潮](うずしお)を[船](ふね)で[見](み)に[行](い)く。", "mean": "격렬한 소용돌이(우즈시오)를 배를 타고 보러 간다." },
        "kun_sentence": { "text": "[事件](じけん)の[渦中](かちゅう)に[巻](ま)き[込](こ)まれた。", "mean": "사건의 와중에 휘말렸다." }
    },
    "釜": {
        "on_sentence": { "text": "[釜山](ぷさん)[行](い)きのフェリーに[乗](の)る。", "mean": "부산행 페리에 탄다." },
        "kun_sentence": { "text": "[御釜](おかま)で[御飯](ごはん)を[炊](た)く。", "mean": "솥으로 밥을 짓다." }
    },
    "粥": {
        "on_sentence": { "text": "[胃腸](いちょう)が[弱](よわ)い[時](とき)は[粥](かゆ)を[食](た)べる。", "mean": "위장이 약할 때는 죽을 먹는다." },
        "kun_sentence": { "text": "[七草](ななくさ)[粥](가ゆ)を[食](た)べて[健康](けんこう)を[祈](いの)る。", "mean": "나나쿠사가유(칠초죽)를 먹으며 건강을 빈다." }
    },
    "畿": {
        "on_sentence": { "text": "[関西](かんさい)の[中心](ちゅうしん)는 [近畿](きんき)地方だ。", "mean": "간사이의 중심은 긴키 지방이다." },
        "kun_sentence": { "text": "이 [漢字](かんji)는 [通常](두지ょう)[訓독](くんどく)에서는 [使用](사용)되지 않습니다.", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." }
    },
    "膳": {
        "on_sentence": { "text": "[箸](はし)を[一膳](いちぜん)[用意](ようい)する。", "mean": "젓가락을 한 쌍 준비한다." },
        "kun_sentence": { "text": "[豪華](ごうか)な[御膳](ごぜん)を[頂](いただ)く。", "mean": "화려한 어선(식사)을 받다." }
    },
    "噌": {
        "on_sentence": { "text": "[朝食](ちょうしょく)に[味噌汁](みそしる)を[飲](の)む。", "mean": "아침 식사로 된장국을 마신다." },
        "kun_sentence": { "text": "이 [漢字](かんji)는 [通常](つうじょう)[訓독](くんどく)에서는 [사용](사용)되지 않습니다.", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." }
    },
    "駄": {
        "on_sentence": { "text": "[最近](さいきん)は[無駄](むだ)な[買](か)い[物](もの)を[多](おお)くした。", "mean": "최근에는 헛된 쇼핑을 많이 했다." },
        "kun_sentence": { "text": "[駄賃](だちん)をもらって[使](つか)いに行く。", "mean": "사례비(푼돈)를 받고 심부름을 가다." }
    },
    "旦": {
        "on_sentence": { "text": "[元旦](がんたん)に[初詣](はつもうで)に出かける。", "mean": "원단에 하츠모데(새해 첫 참배)를 가다." },
        "kun_sentence": { "text": "[旦那](だんな)の[帰](かえ)りを[心](こころ)待ちにする。", "mean": "남편의 귀가를 고대한다." }
    },
    "椎": {
        "on_sentence": { "text": "[脊椎](せきつい)の[骨](ほね)を[痛](いた)める。", "mean": "척추 뼈를 다치다." },
        "kun_sentence": { "text": "[椎](しい)の[木](き)の[実](み)を[拾](ひろ)る。", "mean": "밤나무 열매를 줍다." }
    },
    "慰": {
        "on_sentence": { "text": "[慰謝料](いしゃりょう)を[請求](せいきゅう)する。", "mean": "위자료를 청구하다." },
        "kun_sentence": { "text": "[泣](な)いている[友達](ともだち)を[慰](なぐさ)める。", "mean": "울고 있는 친구를 위로하다." }
    }
};

let count = 0;
data.forEach(d => {
    if (updates[d.kanji]) {
        d.on_sentence = updates[d.kanji].on_sentence;
        d.kun_sentence = updates[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Finished ALL remediation for N1/N2.`);
