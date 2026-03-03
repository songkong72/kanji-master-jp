const fs = require('fs');
const dataFile = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
let maxId = Math.max(...data.map(d => d.id || 0));

const newKanjis = [
    {
        "kanji": "暮", "meaning": "저물 모", "on_reading": "ボ", "kun_reading": "く.れる, く.らす", "category": "N2",
        "explanation": "해(日)가 풀(艹) 사이로 숨고 커다란(大) 어둠이 내리는 모습에서 해가 저무는 것을 뜻해요.",
        "examples": [{ "word": "夕暮れ", "mean": "해 질 녘", "reading": "ゆうぐれ" }],
        "on_sentence": { "text": "お[歳暮](せいぼ)の[季節](きせつ)になった。", "mean": "연말 선물의 계절이 되었다." },
        "kun_sentence": { "text": "もうすぐ[日](ひ)が[暮](く)れる。", "mean": "이제 곧 해가 저문다." }, "subcategory": "시간/기간"
    },
    {
        "kanji": "骨", "meaning": "뼈 골", "on_reading": "コツ", "kun_reading": "ほね", "category": "N2",
        "explanation": "뼈가 살로 덮여 있는 모습을 본뜬 글자로, 사람이나 동물의 뼈를 의미해요.",
        "examples": [{ "word": "骨折", "mean": "골절", "reading": "こっせつ" }],
        "on_sentence": { "text": "[足](あし)を[骨折](こっせつ)してしまった。", "mean": "다리를 골절당해 버렸다." },
        "kun_sentence": { "text": "[魚](さかな)の[骨](ほね)を取って[食](た)べる。", "mean": "물고기의 뼈를 발라 먹다." }, "subcategory": "신체/감각"
    },
    {
        "kanji": "祈", "meaning": "빌 기", "on_reading": "キ", "kun_reading": "いの.る", "category": "N2",
        "explanation": "신(示) 앞에서 도끼(斤)를 들고 제물을 바치며 소원을 비는 모습이에요.",
        "examples": [{ "word": "祈願", "mean": "기원", "reading": "きがん" }],
        "on_sentence": { "text": "[合格](ごうかく)を[祈願](きがん)して神社に行く。", "mean": "합격을 기원하며 신사에 간다." },
        "kun_sentence": { "text": "[平和](へいわ)を[心](こころ)から[祈](いの)る。", "mean": "평화를 진심으로 기도하다." }, "subcategory": "종교/신앙"
    },
    {
        "kanji": "叫", "meaning": "부르짖을 규", "on_reading": "キョウ", "kun_reading": "さけ.ぶ", "category": "N2",
        "explanation": "입(口)으로 무언가 얽혀있는(丩) 것을 풀기 위해 크게 부르짖는 모습이에요.",
        "examples": [{ "word": "絶叫", "mean": "절규", "reading": "ぜっきょう" }],
        "on_sentence": { "text": "ジェットコースターで[絶叫](ぜっきょう)する。", "mean": "롤러코스터에서 절규하다." },
        "kun_sentence": { "text": "[助](たす)けてと[大声](おおごえ)で[叫](さけ)ぶ。", "mean": "살려달라고 큰 소리로 부르짖다." }, "subcategory": "입/소리"
    },
    {
        "kanji": "互", "meaning": "서로 호", "on_reading": "ゴ", "kun_reading": "たが.い", "category": "N2",
        "explanation": "실을 감는 도구의 모양으로, 실이 서로 교차하는 모습에서 '서로'를 뜻하게 되었어요.",
        "examples": [{ "word": "相互", "mean": "상호", "reading": "そうご" }, { "word": "お互い", "mean": "서로", "reading": "おたがい" }],
        "on_sentence": { "text": "[相互](そうご)[理解](りかい)を[深](ふか)める。", "mean": "상호 이해를 깊게 하다." },
        "kun_sentence": { "text": "お[互](たが)いに[助](たす)け[合](あ)いましょう。", "mean": "서로 돕고 삽시다." }, "subcategory": "관계/사회"
    },
    {
        "kanji": "悲", "meaning": "슬플 비", "on_reading": "ヒ", "kun_reading": "かな.しい, かな.しむ", "category": "N2",
        "explanation": "마음(心)이 새의 날개(非)처럼 갈라져 찢어지듯 슬픈 감정을 나타내요.",
        "examples": [{ "word": "悲劇", "mean": "비극", "reading": "ひげき" }],
        "on_sentence": { "text": "それはあまりにも[悲惨](ひさん)な[事故](じこ)だった。", "mean": "그것은 너무나도 비참한 사고였다." },
        "kun_sentence": { "text": "[家族](かぞく)と[別](わか)れてとても[悲](かな)しい。", "mean": "가족과 헤어져서 너무 슬프다." }, "subcategory": "마음"
    },
    {
        "kanji": "怒", "meaning": "성낼 노", "on_reading": "ド", "kun_reading": "いか.る, おこ.る", "category": "N2",
        "explanation": "노비(奴)가 마음(心)속에서 불만을 품고 화를 내는 모습이에요.",
        "examples": [{ "word": "怒り", "mean": "분노", "reading": "いかり" }],
        "on_sentence": { "text": "[怒号](どごう)が[飛](と)び[交](か)う。", "mean": "성난 고함이 오가다." },
        "kun_sentence": { "text": "[彼](かれ)はひどく[怒](おこ)っている。", "mean": "그는 몹시 화를 내고 있다." }, "subcategory": "마음"
    },
    {
        "kanji": "恐", "meaning": "두려울 공", "on_reading": "キョウ", "kun_reading": "おそ.れる, おそ.ろしい", "category": "N2",
        "explanation": "공(工)과 무루(凡)가 합쳐져서 마음(心)속에 느끼는 두려움(공포)을 나타내요.",
        "examples": [{ "word": "恐竜", "mean": "공룡", "reading": "きょうりゅう" }, { "word": "恐怖", "mean": "공포", "reading": "きょうふ" }],
        "on_sentence": { "text": "[恐竜](きょうりゅう)の[化石](かせき)を[見](み)た。", "mean": "공룡의 화석을 봤다." },
        "kun_sentence": { "text": "[失敗](しっぱい)を[恐](おそ)れないでください。", "mean": "실패를 두려워하지 마세요." }, "subcategory": "마음"
    },
    {
        "kanji": "恥", "meaning": "부끄러울 치", "on_reading": "チ", "kun_reading": "は.じる, はじ, は.ずかしい", "category": "N2",
        "explanation": "마음(心)에 부끄러움을 느껴 귀(耳)가 빨개지는 모습을 뜻해요.",
        "examples": [{ "word": "恥ずかしい", "mean": "부끄럽다", "reading": "はずかしい" }],
        "on_sentence": { "text": "[羞恥心](しゅうちしん)が[無](な)いのか。", "mean": "수치심이 없는 건가." },
        "kun_sentence": { "text": "[皆](みな)の[前](まえ)で[転](ころ)んで[恥](は)ずかしい。", "mean": "모두의 앞에서 넘어져서 부끄럽다." }, "subcategory": "마음"
    },
    {
        "kanji": "頼", "meaning": "의지할 뢰", "on_reading": "ライ", "kun_reading": "たの.む, たよ.る", "category": "N2",
    "explanation": "사람의 머리(頁)를 불(束)에 기대어 둔다는 뜻에서 의지하다, 부탁하다의 의미가 파생되었어요.",
        "examples": [{ "word": "依頼", "mean": "의뢰", "reading": "いらい" }, { "word": "信頼", "mean": "신뢰", "reading": "しんらい" }],
        "on_sentence": { "text": "弁護士に[依頼](いらい)する。", "mean": "변호사에게 의뢰하다." },
        "kun_sentence": { "text": "親に[頼](たよ)らずに生きる。", "mean": "부모에게 의지하지 않고 살다." }, "subcategory": "기타"
    },
    {
        "kanji": "悩", "meaning": "번뇌할 뇌", "on_reading": "ノウ", "kun_reading": "なや.む, なや.ます", "category": "N2",
        "explanation": "머리털(𡿨)이 마음(心)을 찌르는 듯한 고통이나 고민, 번뇌를 가리켜요.",
        "examples": [{ "word": "煩悩", "mean": "번뇌", "reading": "ぼんのう" }],
        "on_sentence": { "text": "[苦悩](くのう)の[末](すえ)、[決断](けつだん)した。", "mean": "고뇌 끝에 결단했다." },
        "kun_sentence": { "text": "進路について[悩](なや)んでいる。", "mean": "진로에 대해 고민하고 있다." }, "subcategory": "마음"
    },
    {
        "kanji": "迷", "meaning": "미혹할 미", "on_reading": "メイ", "kun_reading": "まよ.う", "category": "N2",
        "explanation": "갈림길(米)에서 나아가지(辶) 못하고 망설이거나 길을 잃는다는 뜻이에요.",
        "examples": [{ "word": "迷惑", "mean": "민폐", "reading": "めいわく" }, { "word": "迷子", "mean": "미아", "reading": "まいご" }],
        "on_sentence": { "text": "人に[迷惑](めいわく)をかけてはいけない。", "mean": "남에게 민폐를 끼쳐서는 안 된다." },
        "kun_sentence": { "text": "[道](みち)に[迷](まよ)ってしまいました。", "mean": "길을 잃어버렸습니다." }, "subcategory": "이동/보행"
    },
    {
        "kanji": "戻", "meaning": "어그러질 려", "on_reading": "レイ", "kun_reading": "もど.す, もど.る", "category": "N2",
        "explanation": "개(犬)가 문(戸) 밑으로 다시 돌아오는 모습에서 원래의 상태나 장소로 돌아가다란 의미가 생겼어요.",
        "examples": [{ "word": "払い戻し", "mean": "환불", "reading": "はらいもどし" }],
        "on_sentence": { "text": "[返戻](へんれい)[金](きん)を受け取る。", "mean": "반환금을 받다." },
        "kun_sentence": { "text": "使った物は[元](もと)の[場所](ばしょ)に[戻](もど)してください。", "mean": "사용한 물건은 원래 장소로 돌려놓으세요." }, "subcategory": "기타"
    },
    {
        "kanji": "眠", "meaning": "잘 면", "on_reading": "ミン", "kun_reading": "ねむ.る, ねむ.い", "category": "N2",
        "explanation": "백성(民)들이 밤이 되어 눈(目)을 감고 잠에 드는 모습이에요.",
        "examples": [{ "word": "睡眠", "mean": "수면", "reading": "すいみん" }, { "word": "眠い", "mean": "졸리다", "reading": "ねむい" }],
        "on_sentence": { "text": "[睡眠](すいみん)[不足](ぶそく)で頭が痛い。", "mean": "수면 부족으로 머리가 아프다." },
        "kun_sentence": { "text": "昨日遅くまで[勉強](べんきょう)したので[眠](ねむ)い。", "mean": "어제 늦게까지 공부해서 졸리다." }, "subcategory": "쉬기/수면"
    },
    {
        "kanji": "捕", "meaning": "잡을 포", "on_reading": "ホ", "kun_reading": "と.らえる, つか.まえる, つか.まる", "category": "N2",
        "explanation": "손(扌)으로 크고(甫) 도망가는 짐승을 단단히 붙잡는다는 의미입니다.",
        "examples": [{ "word": "逮捕", "mean": "체포", "reading": "たいほ" }],
        "on_sentence": { "text": "泥棒が[逮捕](たいほ)された。", "mean": "도둑이 체포되었다." },
        "kun_sentence": { "text": "警察が犯人を[捕](つか)まえた。", "mean": "경찰이 범인을 잡았다." }, "subcategory": "손/동작"
    },
    {
        "kanji": "逃", "meaning": "도망할 도", "on_reading": "トウ", "kun_reading": "に.げる, に.がす, のが.れる", "category": "N2",
        "explanation": "징조(兆)를 느끼고 길(辶)을 따라 빨리 벗어나 도망치는 것을 뜻해요.",
        "examples": [{ "word": "逃亡", "mean": "도망", "reading": "とうぼう" }],
        "on_sentence": { "text": "犯人が[国外](こくがい)に[逃亡](とうぼう)した。", "mean": "범인이 국외로 도망쳤다." },
        "kun_sentence": { "text": "[危](あぶ)ないので急いで[逃](に)げた。", "mean": "위험해서 서둘러 도망쳤다." }, "subcategory": "이동/보행"
    },
    {
        "kanji": "越", "meaning": "넘을 월", "on_reading": "エツ", "kun_reading": "こ.す, こ.える", "category": "N2",
        "explanation": "달리며(走) 도끼(戉)를 들고 국경이나 장애물을 뛰어넘는 모습에서 유래해요.",
        "examples": [{ "word": "引越し", "mean": "이사", "reading": "ひっこし" }],
        "on_sentence": { "text": "冬を[越冬](えっとう)する鳥。", "mean": "겨울을 나는(월동) 새." },
        "kun_sentence": { "text": "その[山](やま)を[越](こ)えると海が見えます。", "mean": "그 산을 넘으면 바다가 보입니다." }, "subcategory": "이동/보행"
    },
    {
        "kanji": "渡", "meaning": "건널 도", "on_reading": "ト", "kun_reading": "わた.る, わた.す", "category": "N2",
        "explanation": "물(氵)의 이쪽에서 저쪽(度)으로 이동하며 건너가는 모습을 나타내요.",
        "examples": [{ "word": "渡米", "mean": "도미 (미국으로 건너감)", "reading": "とべい" }],
        "on_sentence": { "text": "来月、勉強のために[渡米](とべい)する。", "mean": "다음 달, 공부를 위해 도미한다(미국에 간다)." },
        "kun_sentence": { "text": "[横断歩道](おうだんほどう)を[渡](わた)る。", "mean": "횡단보도를 건너다." }, "subcategory": "이동/보행"
    },
    {
        "kanji": "喜", "meaning": "기쁠 희", "on_reading": "キ", "kun_reading": "よろこ.ぶ", "category": "N2",
        "explanation": "악기를 두드리며 입(口)으로 크게 웃고 기뻐하는 모양을 형상화했어요.",
        "examples": [{ "word": "喜劇", "mean": "희극", "reading": "きげき" }, { "word": "大喜び", "mean": "크게 기뻐함", "reading": "おおよろこび" }],
        "on_sentence": { "text": "[喜劇](きげき)で[有名](ゆうめい)な俳優だ。", "mean": "희극으로 유명한 배우다." },
        "kun_sentence": { "text": "プレゼントをもらって[喜](よろこ)ぶ。", "mean": "선물을 받고 기뻐하다." }, "subcategory": "마음"
    },
    {
        "kanji": "破", "meaning": "깨뜨릴 파", "on_reading": "ハ", "kun_reading": "やぶ.る, やぶ.れる", "category": "N2",
        "explanation": "돌(石)을 가죽(皮)이 찢어지도록 세게 쳐서 깨뜨린다는 의미예요.",
        "examples": [{ "word": "破壊", "mean": "파괴", "reading": "はかい" }, { "word": "破片", "mean": "파편", "reading": "はへん" }],
        "on_sentence": { "text": "自然[破壊](はかい)が[進](すす)んでいる。", "mean": "자연 파괴가 진행되고 있다." },
        "kun_sentence": { "text": "紙が[破](やぶ)れてしまった。", "mean": "종이가 찢어져 버렸다." }, "subcategory": "상태"
    },
    {
        "kanji": "割", "meaning": "벨 할", "on_reading": "カツ", "kun_reading": "わ.る, わ.れる, わり, さ.く", "category": "N2",
        "explanation": "칼(刀)로 사물을 반(害)으로 베어 나누는 것을 뜻해요.",
        "examples": [{ "word": "割引", "mean": "할인", "reading": "わりびき" }, { "word": "割合", "mean": "비율", "reading": "わりあい" }],
        "on_sentence": { "text": "水で[分割](ぶんかつ)して飲む。", "mean": "물로 분할하여(나누어) 마신다." },
        "kun_sentence": { "text": "コップを落として[割](わ)ってしまった。", "mean": "컵을 떨어뜨려 깨고 말았다." }, "subcategory": "손/동작"
    },
    {
        "kanji": "飾", "meaning": "꾸밀 식", "on_reading": "ショク", "kun_reading": "かざ.る", "category": "N2",
        "explanation": "사람(人)이 밥(食)과 물건(巾)을 화려하게 장식하여 꾸민다는 의미입니다.",
        "examples": [{ "word": "装飾", "mean": "장식", "reading": "そうしょく" }],
        "on_sentence": { "text": "部屋の[装飾](そうしょく)を[変更](へんこう)する。", "mean": "방의 장식을 변경하다." },
        "kun_sentence": { "text": "壁に[絵](え)を[飾](かざ)る。", "mean": "벽에 그림을 장식하다(걸다)." }, "subcategory": "사물"
    },
    {
        "kanji": "探", "meaning": "찾을 탐", "on_reading": "タン", "kun_reading": "さぐ.る, さが.す", "category": "N2",
        "explanation": "손(扌)으로 등불이나 막대기(罙)를 들고 깊은 곳을 더듬어 찾는 모습이에요.",
        "examples": [{ "word": "探検", "mean": "탐험", "reading": "たんけん" }],
        "on_sentence": { "text": "宇宙を[探検](たんけん)する。", "mean": "우주를 탐험하다." },
        "kun_sentence": { "text": "落とした[財布](さいふ)を[探](さが)す。", "mean": "떨어뜨린 지갑을 찾다." }, "subcategory": "손/동작"
    },
    {
        "kanji": "捨", "meaning": "버릴 사", "on_reading": "シャ", "kun_reading": "す.てる", "category": "N2",
        "explanation": "손(扌)으로 불필요한 집(舎)의 물건을 밖으로 내다 버린다는 뜻이에요.",
        "examples": [{ "word": "四捨五入", "mean": "사사오입, 반올림", "reading": "ししゃごにゅう" }],
        "on_sentence": { "text": "小数第一位を[四捨五入](ししゃごにゅう)する。", "mean": "소수 첫째 자리를 반올림하다." },
        "kun_sentence": { "text": "ここにゴミを[捨](す)てないでください。", "mean": "여기에 쓰레기를 버리지 마세요." }, "subcategory": "손/동작"
    },
    {
        "kanji": "拝", "meaning": "절할 배", "on_reading": "ハイ", "kun_reading": "おが.む", "category": "N2",
        "explanation": "두 손(扌)을 한 데 모아(手) 높은 분이나 신에게 절하며 예를 표하는 모양을 나타내요.",
        "examples": [{ "word": "拝見する", "mean": "보다(겸양어)", "reading": "はいけんする" }],
        "on_sentence": { "text": "お手紙を[拝見](はいけん)しました。", "mean": "편지를 읽어 보았습니다." },
        "kun_sentence": { "text": "神社で[神様](かみさま)を[拝](おが)む。", "mean": "신사에서 신에게 절을 올리다." }, "subcategory": "예의/인사"
    }
];

newKanjis.forEach(nj => {
    if (!data.find(d => d.kanji === nj.kanji)) {
        nj.id = ++maxId;
        data.push(nj);
    }
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('Added ' + newKanjis.length + ' N2 Kanjis.');
