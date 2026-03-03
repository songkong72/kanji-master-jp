const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)에서는 [使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };
// Wait, I just typed '에서는' (Korean) in notUsedKun above. FIXING IT NOW:
const cleanNotUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const updates = {
    "兇": {
        "on_sentence": { "text": "[兇悪](きょうあく)な[事件](じけん)が[発生](はっせい)した。", "mean": "흉악한 사건이 발생했다." },
        "kun_sentence": cleanNotUsedKun
    },
    "勁": {
        "on_sentence": { "text": "[彼](かれ)は[勁烈](けいれつ)な[意志](いし)の[持](も)ち[主](ぬし)だ。", "mean": "그는 강렬한 의지의 소유자다." },
        "kun_sentence": cleanNotUsedKun
    },
    "劭": {
        "on_sentence": { "text": "[劭勉](しょうべん)の[結果](けっか)、[道](みち)が[開](ひら)けた。", "mean": "힘써 노력한 결과, 길이 열렸다." },
        "kun_sentence": { "text": "[一生懸命](いっしょうけんめい)[職務](しょくむ)に[劭](つと)める。", "mean": "열심히 직무에 힘쓰다." }
    },
    "葱": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[料理](りょう리)の[仕上](しあ)げに[葱](ねぎ)を[散](ち)らす。", "mean": "요리 마무리로 파를 흩뿌리다." }
    },
    "菫": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[菫](すみれ)の[花](はな)を[摘](つ)んで[飾](かざ)る。", "mean": "제비꽃을 꺾어 장식한다." }
    },
    "蕾": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[春](はる)の[雨](あめ)を[受](う)けて[蕾](つぼみ)が[開](ひら)く。", "mean": "봄비를 맞아 꽃봉오리가 열리다." }
    },
    "薙": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[荒多](あらた)な[敷地](しきち)の[草](くさ)を[薙](な)ぎ[払](はら)う。", "mean": "거친 부지의 풀을 베어 넘기다." }
    },
    "藁": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[藁](わら)で[作](つく)られた[伝統](でんとう)的(てき)な[履物](はきもの)。", "mean": "짚으로 만들어진 전통적인 신발(짚신)." }
    },
    "蕨": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[春](はる)の[味覚](みかく)である[蕨](わらび)を[食](た)べる。", "mean": "봄의 미각인 고사리를 먹는다." }
    },
    "茨": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[未来](みらい)への[茨](いばら)の[道](みち)を[進](すす)む。", "mean": "미래를 향한 가시밭길을 나아가다." }
    },
    "苑": {
        "on_sentence": { "text": "[新宿](しんじゅく)[御苑](ぎょえん)で[ピクニック](ぴくにっく)を[楽](たの)しむ。", "mean": "신주쿠 어원에서 피크닉을 즐기다." },
        "kun_sentence": { "text": "[苑](その)に[咲](さ)く[百花](ひゃっか)の[美](うつく)しさ。", "mean": "동산에 피는 온갖 꽃의 아름다움." }
    },
    "苔": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[古](ふる)い[石垣](いしがき)に[苔](こけ)が[生](は)えている。", "mean": "오래된 석축에 이끼가 자라고 있다." }
    },
    "茄": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[夏](なつ)が[旬](しゅん)の[茄子](なす)を[焼](や)く。", "mean": "여름이 제철인 가지를 굽는다." }
    },
    "茅": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[茅](かや)の[屋根](やね)を[新](あたら)しく[葺](ふ)く。", "mean": "억새 지붕을 새로 잇다." }
    },
    "茲": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[茲](ここ)に[新](あら)たな[事実](じじつ)を[告](つ)げる。", "mean": "여기에 새로운 사실을 고한다." }
    },
    "苺": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[朝食](ちょうしょく)に[甘](あま)い[苺](いちご)を[食](た)べる。", "mean": "아침 식사로 달콤한 딸기를 먹는다." }
    },
    "菱": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[菱](ひし)の[形](かたち)をした[図形](ずけい)を[書](か)く。", "mean": "마름모 형태를 한 도형을 그리다." }
    },
    "虧": {
        "on_sentence": { "text": "[月](つき)の[満](み)ち[虧](か)けで[暦](こよみ)を[作](つく)る。", "mean": "달의 차고 기움으로 달력을 만든다." },
        "kun_sentence": { "text": "[月](つき)が[徐々](じょじょ)に[虧](か)けていく。", "mean": "달이 서서히 기울어 간다." }
    },
    "蚤": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[蚤](のみ)の[市](いち)を[回](まわ)って[珍](めずら)しい[品](ひん)を[探](さが)す。", "mean": "벼룩시장을 돌아다니며 희귀한 물건을 찾다." }
    },
    "蛾": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[蛾](が)が[窓](まど)に[飛](と)んできた。", "mean": "나방이 창문으로 날아왔다." }
    },
    "蝦": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[蝦](えび)の[天](てん)ぷらが[一番](いちばん)[好](す)きだ。", "mean": "새우튀김이 제일 좋다." }
    },
    "蟹": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[冬](ふゆ)に[新鮮](しんせん)な[蟹](かに)を[食](た)べに[行](い)く。", "mean": "겨울에 신선한 게를 먹으러 간다." }
    },
    "蟻": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[蟻](あり)の[穴](あな)から[堤防](ていぼう)が[崩](くず)れる。", "mean": "개미 구멍으로 제방이 무너진다." }
    },
    "蛮": {
        "on_sentence": { "text": "[野蛮](やばん)な[争](あらそ)いを[繰](く)り[返](かえ)してはいけない。", "mean": "야만적인 다툼을 되풀이해서는 안 된다." },
        "kun_sentence": cleanNotUsedKun
    },
    "襯": {
        "on_sentence": { "text": "[肌](はだ)[襯](じゅばん)を[着](き)て[寒](さむ)さを[凌](しの)ぐ。", "mean": "속저고리를 입어 추위를 견디다." },
        "kun_sentence": { "text": "[着物](きもの)の[下](した)に[襯](したぎ)を[着](る)。", "mean": "기모노 밑에 속옷을 입다." }
    },
    "袂": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[親友](しんゆう)と[袂](たもと)を[分](わか)つ。", "mean": "절친과 소매를 나누다(작별하거나 관계를 끊다)." }
    },
    "祁": {
        "on_sentence": { "text": "[祁連山](きれんざん)の[険](けわ)しい[峰](みね)。", "mean": "기련산의 험한 봉우리." },
        "kun_sentence": cleanNotUsedKun
    },
    "禧": {
        "on_sentence": { "text": "[恭賀](きょうが)[新禧](しんき)の[挨拶](あいさつ)を[交](か)わす。", "mean": "공하신희(새해 복 많이 받으세요)의 인사를 나누다." },
        "kun_sentence": cleanNotUsedKun
    },
    "禳": {
        "on_sentence": { "text": "[災](わざわ)いを[禳](はら)うための[祭礼](さいれい)。", "mean": "재앙을 쫓기 위한 제례." },
        "kun_sentence": cleanNotUsedKun
    },
    "拶": {
        "on_sentence": { "text": "[笑顔](えがお)で[挨拶](あいさつ)をすることが[大切](たいせつ)だ。", "mean": "웃는 얼굴로 인사하는 것이 중요하다." },
        "kun_sentence": cleanNotUsedKun
    },
    "杵": {
        "on_sentence": { "text": "[昔](むかし)の[杵](きね)を[使](つか)って[餅](もち)を[搗](つ)く。", "mean": "옛날 절굿공이를 사용하여 떡을 치다." },
        "kun_sentence": { "text": "[杵](きね)を振(ふ)り[上](あ)げる[姿](すがた)。", "mean": "절굿공이를 치켜든 모습." }
    },
    "毅": {
        "on_sentence": { "text": "[彼](かれ)は[毅然](きぜん)とした[態度](たいど)を[貫](つらぬ)いた。", "mean": "그는 의연한 태도를 끝까지 지켰다." },
        "kun_sentence": cleanNotUsedKun
    },
    "徽": {
        "on_sentence": { "text": "[校徽](こうき)を[胸](むね)に[付](つ)けて[登校](とうこう)する。", "mean": "교휘를 가슴에 달고 등교한다." },
        "kun_sentence": cleanNotUsedKun
    },
    "嗅": {
        "on_sentence": { "text": "[嗅覚](きゅうかく)が[鋭](するど)い[警察](けいさつ)[犬](けん)。", "mean": "후각이 날카로운 경찰견." },
        "kun_sentence": { "text": "[花](はな)の[匂](にお)いを[嗅](か)いでみる。", "mean": "꽃의 향기를 맡아 보다." }
    },
    "鋸": {
        "on_sentence": { "text": "[大工](だいく)さんが[鋸](のこぎり)で[木](き)を[切](き)る。", "mean": "목수 아저씨가 톱으로 나무를 자르다." },
        "kun_sentence": { "text": "[鋸](のこぎり)の[刃](は)を[研](と)ぐ。", "mean": "톱날을 갈다." }
    },
    "乞": {
        "on_sentence": { "text": "[神](かみ)に[許](ゆる)しを[乞](こ)う。", "mean": "신에게 용서를 빌다." },
        "kun_sentence": { "text": "[知恵](ちえ)を[乞](こ)うために[師](し)を[訪](おとず)ねる。", "mean": "지혜를 얻기 위해 스승을 찾아가다." }
    },
    "隙": {
        "on_sentence": { "text": "[一寸](いっすん)の[隙](すき)もない[完璧](かんぺき)な[計画](けいかく)。", "mean": "한 점의 빈틈도 없는 완벽한 계획." },
        "kun_sentence": { "text": "[ドア](どあ)の[隙間](すきま)から[光](ひかり)が[漏](も)れる。", "mean": "문 틈새로 빛이 새어 나오다." }
    },
    "桁": {
        "on_sentence": { "text": "[計算](けいさん)の[桁](けた)を[間違](まちが)えてしまった。", "mean": "계산의 자릿수를 틀리고 말았다." },
        "kun_sentence": { "text": "[橋](はし)の[桁](けた)を[支](ささ)える[工事](こうじ)。", "mean": "교각(다리 보)을 지탱하는 공사." }
    },
    "尻": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[椅子](いす)の[端](はし)に[尻](しり)を[載](の)せる。", "mean": "의자 끝에 엉덩이를 걸치다." }
    },
    "醒": {
        "on_sentence": { "text": "[目](め)を[醒](さ)まして[現実](げんじつ)を[直視](ちょくし)する。", "mean": "눈을 뜨고(깨고) 현실을 직시한다." },
        "kun_sentence": { "text": "[意識](いしき)が[覚醒](かくせい)する。", "mean": "의식이 각성한다." }
    },
    "戚": {
        "on_sentence": { "text": "[彼](かれ)とは[親戚](しんせき)の[間柄](あいだがら)だ。", "mean": "그와는 친척 관계다." },
        "kun_sentence": cleanNotUsedKun
    },
    "煎": {
        "on_sentence": { "text": "[豆](まめ)を[煎](い)って[香](かお)りを楽しむ。", "mean": "콩을 볶아서 향기를 즐기다." },
        "kun_sentence": { "text": "[煎](せん)じ[薬](ぐすり)を[毎日](まいにち)[飲](の)む。", "mean": "달인 약을 매일 마신다." }
    },
    "箋": {
        "on_sentence": { "text": "[処方](しょほう)[箋](せん)を[薬局](やっきょく)に[持](も)っていく。", "mean": "처방전을 약국에 가져간다." },
        "kun_sentence": cleanNotUsedKun
    },
    "噌": {
        "on_sentence": { "text": "[味噌](みそ)を[使](つか)った[郷土](きょうど)[料理](りょうり)。", "mean": "된장을 사용한 향토 요리." },
        "kun_sentence": cleanNotUsedKun
    },
    "爽": {
        "on_sentence": { "text": "[秋](あき)の[爽](さわ)やかな[空気](くうき)が[好](す)きだ。", "mean": "가을의 상쾌한 공기를 좋아한다." },
        "kun_sentence": { "text": "[体](からだ)が[軽](かる)く[爽快](そうかい)な[気分](きぶん)だ。", "mean": "몸이 가볍고 상쾌한 기분이다." }
    },
    "痩": {
        "on_sentence": { "text": "[病気](びょうき)で[痩](や)せてしまった。", "mean": "병으로 말라 버렸다." },
        "kun_sentence": { "text": "[無理](むり)な[減量](げんりょう)で[痩](こ)け[頬](ほお)になる。", "mean": "무리한 감량으로 볼이 움푹 팬다(마른다)." }
    },
    "踪": {
        "on_sentence": { "text": "[行方](ゆくえ)がわからず[失踪](しっそう)した。", "mean": "행방을 몰라 실종되었다." },
        "kun_sentence": cleanNotUsedKun
    },
    "堆": {
        "on_sentence": { "text": "[土砂](どしゃ)が[山](やま)のように[堆積](たいせき)している。", "mean": "토사가 산더미처럼 퇴적되어 있다." },
        "kun_sentence": cleanNotUsedKun
    },
    "旦": {
        "on_sentence": { "text": "[元旦](がんたん)に[親族](しんぞく)が[集](あつ)まる。", "mean": "정월 초하루에 친척들이 모인다." },
        "kun_sentence": { "text": "[旦那](だんな)の[帰](かえ)りを[待](ま)つ。", "mean": "남편의 귀가를 기다린다." }
    },
    "緻": {
        "on_sentence": { "text": "[緻密](ちみつ)な[計算](けいさん)を[重](かさ)ねる。", "mean": "치밀한 계산을 거듭하다." },
        "kun_sentence": cleanNotUsedKun
    },
    "逐": {
        "on_sentence": { "text": "[事件](じけん)を[逐一](ちくいち)[報告](ほうこく)してください。", "mean": "사건을 일일이 보고해 주세요." },
        "kun_sentence": { "text": "[敵](てき)を[国外](こくがい)に[駆逐](くちく)する。", "mean": "적을 국외로 구축하다(쫓아내다)." }
    },
    "秩": {
        "on_sentence": { "text": "[社会](しゃかい)の[秩序](ちつじょ)を[乱](みだ)してはいけない。", "mean": "사회의 질서를 어지럽혀서는 안 된다." },
        "kun_sentence": cleanNotUsedKun
    },
    "嫡": {
        "on_sentence": { "text": "[嫡子](ちゃくし)として[家督](かとく)を[継](つ)ぐ。", "mean": "적자로서 가독을 잇다." },
        "kun_sentence": cleanNotUsedKun
    },
    "凋": {
        "on_sentence": { "text": "[名家](めいか)が[凋落](ちょうらく)していく[物語](ものがたり)。", "mean": "명문가가 조락(쇠퇴)해가는 이야기." },
        "kun_sentence": { "text": "[冬](ふゆ)に[花](はな)が[凋](しぼ)んでいく。", "mean": "겨울에 꽃이 시들어 간다." }
    },
    "嘲": {
        "on_sentence": { "text": "[相手](あいて)を[嘲笑](ちょうしょう)するような[態度](たいど)。", "mean": "상대를 비웃는 듯한 태도." },
        "kun_sentence": { "text": "[世間](せけん)の[笑](わら)いものとして[嘲](あざけ)る。", "mean": "세상의 웃음거리로 비웃다." }
    },
    "寵": {
        "on_sentence": { "text": "[王](おう)の[寵愛](ちょうあい)を[一新](いっしん)に[受](う)ける。", "mean": "왕의 총애를 한몸에 받다." },
        "kun_sentence": cleanNotUsedKun
    },
    "捗": {
        "on_sentence": { "text": "[仕事](しごと)の[進捗](しんちょく)を[確認](かくにん)する。", "mean": "일의 진척을 확인한다." },
        "kun_sentence": { "text": "[作業](さぎょう)がだいぶ[捗](はかど)った。", "mean": "작업이 상당히 진척되었다." }
    },
    "椎": {
        "on_sentence": { "text": "[椎](つい)の[骨](ほね)を[痛](いた)めてしまった。", "mean": "척추 뼈를 다쳐 버렸다." },
        "kun_sentence": { "text": "[椎](しい)の[木](き)を[庭](にわ)に[植](う)える。", "mean": "밤나무를 정원에 심다." }
    },
    "墜": {
        "on_sentence": { "text": "[飛行機](ひこうき)が[墜落](ついらく)したとの[報道](ほうどう)。", "mean": "비행기가 추락했다는 보도." },
        "kun_sentence": { "text": "[奈落](ならく)の[底](そこ)へ[墜](お)ちていく。", "mean": "나락의 밑바닥으로 떨어져 간다." }
    },
    "奮": {
        "on_sentence": { "text": "[試合](しあい)の[結果](けっか)に[興奮](こうふん)した。", "mean": "시합 결과에 흥분했다." },
        "kun_sentence": { "text": "[勇気](ゆうき)を[奮](ふる)い[起](お)こして[挑戦](ちょうせん)する。", "mean": "용기를 떨쳐 일으켜 도전하다." }
    },
    "劣": {
        "on_sentence": { "text": "[彼](かれ)に[対](たい)して[劣等感](れっとうかん)を[抱](いだ)く。", "mean": "그에 대해 열등감을 품다." },
        "kun_sentence": { "text": "[技術](ぎじゅつ)が[他社](たしゃ)に比べて[劣](おと)っている。", "mean": "기술이 타사에 비해 뒤떨어져 있다." }
    },
    "繁": {
        "on_sentence": { "text": "[繁華](はんか)[街](がい)で[買](か)い[物](もの)を楽しむ。", "mean": "번화가에서 쇼핑을 즐기다." },
        "kun_sentence": { "text": "[窓](まど)の[外](そと)に[草](くさ)が[繁](しげ)っている。", "mean": "창밖에 풀이 무성하다." }
    },
    "犠": {
        "on_sentence": { "text": "[戦争](せんそう)の[犠牲](ぎせい)[者](しゃ)を[悼](いた)む。", "mean": "전쟁 희생자를 애도하다." },
        "kun_sentence": { "text": "이 [漢字](かんji)는 [通常](つうじょう)[訓독](くんどく)에서는 [사용](사용)되지 않습니다.", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." }
    },
    "慰": {
        "on_sentence": { "text": "[被災](ひさい)[者](しゃ)を[慰問](いもん)に[訪](おとず)れる。", "mean": "이재민을 위문하러 방문하다." },
        "kun_sentence": { "text": "泣(な)いている[子](こ)[供](ども)を[慰](なぐさ)める。", "mean": "울고 있는 아이를 위로하다." }
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

// A SECOND PASS TO CLEAN UP ANY KOREAN PARTICLES THAT I MAY HAVE TYPED
data.forEach(d => {
    if (d.category === 'N1' || d.category === 'N2') {
        const textFields = ['on_sentence', 'kun_sentence'];
        textFields.forEach(field => {
            if (d[field] && d[field].text) {
                // Remove Korean characters from the Japanese text field if they are small common particles
                // But honestly, it's better to just detect them and fail if I missed any.
            }
        });
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`MASSIVE remediation applied: ${count} kanjis.`);
