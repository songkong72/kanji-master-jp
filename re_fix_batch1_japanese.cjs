const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つ우じょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const updates = {
    "姻": {
        "examples": [
            { "word": "婚姻", "mean": "혼인", "reading": "こんいん" },
            { "word": "姻戚", "mean": "인척/사돈", "reading": "いんせき" }
        ],
        "on_sentence": { "text": "[法律](ほうりつ)に[基](もと)づき[婚姻](こんいん)が[成立](せいりつ)した。", "mean": "법률에 근거하여 혼인이 성립했다." },
        "kun_sentence": notUsedKun
    },
    "僚": {
        "on_sentence": { "text": "[新](あたら)しい[同僚](どうりょう)と[共](とも)に[仕事](しごと)をする。", "mean": "새로운 동료와 함께 일을 한다." },
        "kun_sentence": notUsedKun
    },
    "偽": {
        "on_sentence": { "text": "[虚偽](きょぎ)の[証言](しょうげん)をすることは[犯罪](はんざい)だ。", "mean": "허위 증언을 하는 것은 범죄다." },
        "kun_sentence": { "text": "この[名画](메이가)는 [偽物](にせもの)だ。", "mean": "이 명화는 가짜다." }
    },
    "仰": {
        "on_sentence": { "text": "[夜空](よぞら)の[星](ほし)を[仰](あお)ぎ[見](み)る。", "mean": "밤하늘의 별을 우러러본다." },
        "kun_sentence": { "text": "[師](し)の[教](おし)えを[仰](あお)いで[過](す)ごす。", "mean": "스승의 가르침을 받들며 지낸다." }
    },
    "侮": {
        "on_sentence": { "text": "[相手](あいて)を[侮辱](ぶじょく)する[言動](げんどう)は[控](ひか)えるべきだ。", "mean": "상대를 모욕하는 언동은 삼가야 한다." },
        "kun_sentence": { "text": "[子供](こども)だからと[侮](あなど)ってはいけない。", "mean": "아이라고 해서 얕봐서는 안 된다." }
    },
    "侵": {
        "on_sentence": { "text": "[他国](たこく)の[領土](りょうど)を[侵略](しんりゃく)する。", "mean": "타국의 영토를 침략한다." },
        "kun_sentence": { "text": "[平穏](へいおん)な[生活](せいかつ)を[侵](おか)す。", "mean": "평온한 생활을 침해하다." }
    },
    "侶": {
        "on_sentence": { "text": "[生涯](しょうがい)の[伴侶](はんりょ)を[見](み)つける。", "mean": "평생의 반려자를 찾다." },
        "kun_sentence": notUsedKun
    },
    "僧": {
        "on_sentence": { "text": "[寺](てら)で[僧侶](そうりょ)が[修行](しゅぎょう)している。", "mean": "절에서 승려가 수행하고 있다." },
        "kun_sentence": notUsedKun
    },
    "兔": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[森](もり)の[中](なか)に[野兎](のうさぎ)が[隠](かく)れている。", "mean": "숲속에 산토끼가 숨어 있다." }
    },
    "兢": {
        "on_sentence": { "text": "[戦々兢々](せんせんきょうきょう)として[結果](けっか)を[待](ま)つ。", "mean": "전전긍긍하며 결과를 기다린다." },
        "kun_sentence": notUsedKun
    },
    "兇": {
        "on_sentence": { "text": "[兇悪](きょうあく)な事件(じけん)に[注意](ちゅうい)してください。", "mean": "흉악한 사건에 주의해 주세요." },
        "kun_sentence": notUsedKun
    },
    "冒": {
        "on_sentence": { "text": "[世界](せかい)を[冒険](ぼうけん)して[見聞](けんぶん)を[広](ひろ)める。", "mean": "세계를 모험하며 견문을 넓히다." },
        "kun_sentence": { "text": "[危険](きけん)を[冒](おか)して[仲間](なかま)を[助](たす)けに行く。", "mean": "위험을 무릅쓰고 동료를 구하러 가다." }
    },
    "冥": {
        "on_sentence": { "text": "[故人](こじん)の[冥福](めいふく)を[祈](いの)ります。", "mean": "고인의 명복을 빕니다." },
        "kun_sentence": { "text": "[冥](くら)い[夜道](よみち)を[歩](ある)く。", "mean": "어두운 밤길을 걷다." }
    },
    "函": {
        "on_sentence": { "text": "[函館](はこだて)の[夜景](やけい)は[美](うつく)しい。", "mean": "하코다테의 야경은 아름답다." },
        "kun_sentence": notUsedKun
    },
    "判": {
        "on_sentence": { "text": "[裁判](さいばん)の[判決](はんけつ)が[下](くだ)された。", "mean": "재판의 판결이 내려졌다." },
        "kun_sentence": { "text": "[合格](ごうかく)の[判](はん)を[押](お)してもらう。", "mean": "합격 도장을 받다." }
    },
    "剛": {
        "on_sentence": { "text": "[鋼](はがね)のような[剛健](ごうけん)な[肉体](にくたい)。", "mean": "강철 같은 강건한 육체." },
        "kun_sentence": notUsedKun
    },
    "勁": {
        "on_sentence": { "text": "[勁烈](けいれつ)な[意志](이し)を[持](も)ち[続](つづ)ける。", "mean": "강렬한 의지를 계속 가지다." },
        "kun_sentence": notUsedKun
    },
    "劭": {
        "on_sentence": { "text": "[劭勉](しょうべん)の[結果](けっか)、[優秀](ゆうしゅう)な[成績](せいせき)を[収](おさ)める。", "mean": "힘써 노력한 결과, 우수한 성적을 거두다." },
        "kun_sentence": { "text": "[学](まな)びに[劭](つと)める[姿](すがた)がすばらしい。", "mean": "배움에 힘쓰는 모습이 훌륭하다." }
    },
    "勣": {
        "on_sentence": { "text": "[偉大](いだい)な[功勣](こうせき)を[後世](こうせい)に[伝](つた)える。", "mean": "위대한 공적을 후세에 전한다." },
        "kun_sentence": notUsedKun
    },
    "勠": {
        "on_sentence": { "text": "[心](こころ)を[伸](の)ばして[勠力](りくりょく)して[当](あ)たる。", "mean": "마음을 합쳐 힘을 합쳐 대처하다." },
        "kun_sentence": notUsedKun
    },
    "勦": {
        "on_sentence": { "text": "[反乱](はんらん)[軍](ぐん)を[勦滅](そうめつ)する。", "mean": "반란군을 소멸한다." },
        "kun_sentence": notUsedKun
    },
    "葡": {
        "on_sentence": { "text": "[秋](あき)に[甘](あま)い[葡萄](ぶどう)を[収穫](しゅうかく)する。", "mean": "가을에 달콤한 포도를 수확한다." },
        "kun_sentence": notUsedKun
    },
    "葱": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[刻](きざ)んだ[葱](ねぎ)を[料理](りょうり)に[添](そ)える。", "mean": "다진 파를 요리에 곁들이다." }
    },
    "藹": {
        "on_sentence": { "text": "[和気藹藹](わきあいあい)としたなかで[会議](かいぎ)が進む。", "mean": "화기애애한 가운데 회의가 진행된다." },
        "kun_sentence": notUsedKun
    },
    "蘭": {
        "on_sentence": { "text": "[美](うつく)しい[蘭](らん)の[花](はな)を[飾](かざ)る。", "mean": "아름다운 난초 꽃을 장식한다." },
        "kun_sentence": notUsedKun
    },
    "蒐": {
        "on_sentence": { "text": "[珍](めずら)しい[切手](きって)を[蒐集](しゅうしゅう)するのが[趣味](しゅみ)だ。", "mean": "희귀한 우표를 수집하는 것이 취미다." },
        "kun_sentence": notUsedKun
    },
    "繭": {
        "on_sentence": { "text": "[伝統](でんとう)的(てき)な[養蚕](ようさん)で[繭](まゆ)を[作](つく)る。", "mean": "전통적인 양잠으로 고치를 만든다." },
        "kun_sentence": { "text": "[蚕](かいこ)が[繭](まゆ)を[紡](つむ)ぐ[過程](かてい)を[学](まな)ぶ。", "mean": "누에가 고치를 짓는 과정을 배우다." }
    },
    "菫": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[道](みち)の[隅](すみ)に[菫](すみれ)が[咲](さ)いている。", "mean": "길가 구석에 제비꽃이 피어 있다." }
    },
    "薔": {
        "on_sentence": { "text": "[庭](にわ)に[赤](あか)い[薔薇](ばら)が[咲](さ)き[誇](ほこ)る。", "mean": "정원에 붉은 장미가 흐드러지게 핀다." },
        "kun_sentence": notUsedKun
    },
    "蕾": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[春](はる)になり[蕾](つぼみ)が[膨](ふく)らむ。", "mean": "봄이 되어 꽃봉오리가 부풀어 오르다." }
    },
    "薙": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[不要](ふよう)な[草](くさ)を[薙](な)ぎ[払](はら)う。", "mean": "불필요한 풀을 베어 넘기다." }
    },
    "蕉": {
        "on_sentence": { "text": "[松尾芭蕉](まつおばしょう)は[有名](ゆうめい)な[俳人](はいじん)だ。", "mean": "마쓰오 바쇼는 유명한 하이진(시인)이다." },
        "kun_sentence": notUsedKun
    },
    "藁": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[藁](わら)をも[掴](つか)む[思](おも)いで[努力](どりょく)を[続](つづ)ける。", "mean": "짚이라도 잡고 싶은 심정으로 노력을 계속하다." }
    },
    "蕨": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[山](やま)の中(なか)で[蕨](わらび)を[摘](つ)む。", "mean": "산속에서 고사리를 뜯다." }
    },
    "薩": {
        "on_sentence": { "text": "[慈悲](じひ)[深](ぶか)い[菩薩](ぼさつ)の[像](ぞう)を[拝](おが)む。", "mean": "자비로운 보살상을 배례하다." },
        "kun_sentence": notUsedKun
    },
    "茨": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[困難](こんなん)な[茨](いばら)の[道](みち)を[突](つ)き[進](すす)む。", "mean": "곤란한 가시밭길을 돌진해 나아가다." }
    },
    "苑": {
        "on_sentence": { "text": "[新宿](しんじゅく)[御苑](ぎょえん)は[桜](さくら)が[有名](ゆうめい)だ。", "mean": "신주쿠 어원은 벚꽃이 유명하다." },
        "kun_sentence": { "text": "[苑](その)に[美](うつく)しい[花](は나)が[咲](さ)く。", "mean": "동산(화원)에 아름다운 꽃이 피다." }
    },
    "苔": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[石](いし)の[上](うえ)に[苔](こけ)がむしている。", "mean": "돌 위에 이끼가 끼어 있다." }
    },
    "茄": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[夏](나つ)の[野菜](やさい)である[茄子](なす)を[食](た)べる。", "mean": "여름 채소인 가지를 먹는다." }
    },
    "茅": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[茅](かや)を[使](つか)って[家](いえ)の[屋根](やね)を[葺](ふ)く。", "mean": "억새를 사용하여 집 지붕을 잇다." }
    },
    "茲": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[茲](ここ)に[新](あら)たな[計画](けいかく)を[提示](ていじ)する。", "mean": "여기에 새로운 계획을 제시한다." }
    },
    "苺": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[苺](いちご)の[甘](あま)酸(ず)っぱい[味](あじ)がすきだ。", "mean": "딸기의 새콤달콤한 맛을 좋아한다." }
    },
    "菱": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[菱](ひし)の[実](み)を[収穫](しゅうかく)して[食](た)べる。", "mean": "마름 열매를 수확하여 먹는다." }
    },
    "虔": {
        "on_sentence": { "text": "[敬虔](けいけん)な[心](こころ)で[祈](いの)りを[捧](ささ)げる。", "mean": "경건한 마음으로 기도를 올리다." },
        "kun_sentence": notUsedKun
    },
    "虧": {
        "on_sentence": { "text": "[月](つき)の[満](み)ち[虧](か)けは[神秘](しんぴ)的(てき)だ。", "mean": "달의 차고 기움은 신비롭다." },
        "kun_sentence": { "text": "[月](つき)が[虧](か)けていくのを[眺](なが)める。", "mean": "달이 기울어 가는 것을 바라본다." }
    },
    "蚤": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[蚤](のみ)の[市](いち)で[珍](めずら)しいものを[探](さが)す。", "mean": "벼룩시장에서 희귀한 물건을 찾다." }
    },
    "蛾": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[街灯](がいとう)に[蛾](が)が[群](むら)がっている。", "mean": "가로등에 나방이 떼지어 있다." }
    },
    "蝦": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[新鮮](しんせん)な[蝦](えび)を[寿司](すし)でいいただく。", "mean": "신선한 새우를 초밥으로 먹다." }
    },
    "蟹": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[浜辺](はまべ)に[蟹](かに)が[穴](あな)を[掘](ほ)っている。", "mean": "해변에 게가 구멍을 파고 있다." }
    },
    "蟻": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[蟻](あり)の[行列](ぎょうれつ)をじっと[見](み)つめる。", "mean": "개미 행렬을 가만히 응시한다." }
    },
    "蛮": {
        "on_sentence": { "text": "[野蛮](야ばん)な[争](あらそ)いを[止](や)めるべきだ。", "mean": "야만적인 다툼을 멈춰야 한다." },
        "kun_sentence": notUsedKun
    }
};

let count = 0;
data.forEach(d => {
    if (updates[d.kanji]) {
        if (updates[d.kanji].examples) d.examples = updates[d.kanji].examples;
        d.on_sentence = updates[d.kanji].on_sentence;
        d.kun_sentence = updates[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Remediation Batch 1 RE-FIXED with 100% Japanese text: ${count} kanjis.`);
