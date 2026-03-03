const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const fixes = {
    "依": { "kun_sentence": { "text": "[法律](ほうりつ)に[依](よ)って[裁](さば)かれる。", "mean": "법률에 의거하여 심판받다." } },
    "僚": { "kun_sentence": { "text": "[同僚](どうりょう)の[助](たす)けを[乞](こ)う。", "mean": "동료의 도움을 구하다." } },
    "僧": { "kun_sentence": { "text": "[僧侶](そうりょ)になるための[修](しゅ)[行](ぎょう)。", "mean": "승려가 되기 위한 수행." } },
    "剛": { "kun_sentence": { "text": "[質実剛健](しつじつごうけん)な[校風](こうふう)。", "mean": "질실강건한 교풍." } },
    "勁": { "kun_sentence": { "text": "[風](かぜ)이 [勁](つよ)い[日](ひ)。", "mean": "바람이 거센(강한) 날." } }, // Wait, I typed '이' in text. FIXED:
    "勁": { "kun_sentence": { "text": "[風](かぜ)が[勁](つよ)い[日](ひ)。", "mean": "바람이 거센(강한) 날." } },
    "葡": { "kun_sentence": { "text": "[野](や)[生](せい)の[山](やま)[葡萄](ぶどう)。", "mean": "야생 산포도." } },
    "蘭": { "kun_sentence": { "text": "[蘭](らん)の[花](はな)を[飾](かざ)る。", "mean": "난초 꽃을 장식한다." } },
    "薩": { "kun_sentence": { "text": "[慈愛](じあい)に満(み)ちた[菩薩](ぼさつ)。", "mean": "자애가 넘치는 보살." } },
    "蛮": { "kun_sentence": { "text": "[野蛮](야ばん)な[法](ほう)[案](あん)を[阻](そ)止(し)する。", "mean": "야만적인 법안을 저지하다." } },
    "倚": { "kun_sentence": { "text": "[椅](い)り[掛](か)かる。", "mean": "기대다(의지하여 걸치다)." } },
    "彙": { "kun_sentence": { "text": "[語彙](ごい)を[増](ふ)やす。", "mean": "어휘를 늘리다." } },
    "旺": { "kun_sentence": { "text": "[旺盛](おうせい)な[食欲](しょくよく)。", "mean": "왕성한 식욕." } },
    "拐": { "kun_sentence": { "text": "[誘拐](ゆうかい)[事](じ)[件](けん)。", "mean": "유괴 사건." } },
    "喝": { "kun_sentence": { "text": "[喝](かつ)を[入](い)れる。", "mean": "할(호통)을 넣어 정신을 차리게 하다." } },
    "緻": { "kun_sentence": { "text": "[緻密](ちみつ)な[計算](けいさん)。", "mean": "치밀한 계산." } },
    "秩": { "kun_sentence": { "text": "[社会](しゃかい)の[秩序](ちつじょ)。", "mean": "사회의 질서." } },
    "嫡": { "kun_sentence": { "text": "[嫡子](ちゃくし)の[誕](たん)[生](じょう)。", "mean": "적자의 탄생." } },
    "寵": { "kun_sentence": { "text": "[寵愛](ちょうあい)を[受](う)ける。", "mean": "총애를 받다." } },
    "犠": { "kun_sentence": { "text": "[犠牲](ぎせい)を[払](はら)う。", "mean": "희생을 치르다." } },
    "兜": { "kun_sentence": { "text": "[武士](ぶし)が[兜](かぶと)を[被](かぶ)る。", "mean": "무사가 투구(카부토)를 쓰다." } },
    "蟻": { "kun_sentence": { "text": "[蟻](あり)の[列](れつ)。", "mean": "개미 줄(행렬)." } },
    "袒": { "kun_sentence": { "text": "[袒](はだぬぎ)になって[働](はたら)く。", "mean": "어깨를 드러내고 일하다." } },
    "薙": { "kun_sentence": { "text": "[薙](な)ぎ[倒](たお)す。", "mean": "베어 쓰러뜨리다." } },
    "祓": { "kun_sentence": { "text": "[穢](けが)れを[祓](はら)う。", "mean": "부정을 없애다." } },
    "袂": { "kun_sentence": { "text": "[袂](たもと)を[分](わか)つ。", "mean": "작별하다." } },
    "茨": { "kun_sentence": { "text": "[茨](いばら)の[道](みち)。", "mean": "가시밭길." } },
    "尻": { "kun_sentence": { "text": "[尻](しり)を[捲](まく)る。", "mean": "본색을 드러내다(엉덩이를 걷어붙이다)." } },
    "裾": { "kun_sentence": { "text": "[裾](すそ)を[引](ひ)く[事](じ)[態](たい)。", "mean": "꼬리를 무는 사태(영향이 길게 이어지는 상태)." } },
    "緒": { "kun_sentence": { "text": "[鼻](はな)[緒](お)を[挿](す)げる。", "mean": "나막신 끈(오)을 끼다." } },
    "唄": { "kun_sentence": { "text": "[島](しま)[唄](うた)を[聞](き)く。", "mean": "시마우타(섬 노래)를 듣다." } },
    "襟": { "kun_sentence": { "text": "[襟](えり)を[正](ただ)す。", "mean": "옷깃을 여미다." } },
    "背": { "kun_sentence": { "text": "[背](せなか)を[丸](まる)める。", "mean": "등을 구부리다." } },
    "誰": { "kun_sentence": { "text": "[誰](だれ)もが[知](し)っている。", "mean": "누구나 알고 있다." } },
    "麓": { "kun_sentence": { "text": "[山](やま)の[麓](ふもと)。", "mean": "산기슭." } },
    "畿": { "kun_sentence": { "text": "[畿](みやこ)への[道](みち)。", "mean": "도성으로 가는 길." } },
    "脊": { "kun_sentence": { "text": "[脊](せ)すじを[伸](の)ばす。", "mean": "등줄기를 펴다." } },
    "薯": { "kun_sentence": { "text": "[山](やま)[薯](いも)を[食](た)べる。", "mean": "마(야마이모)를 먹는다." } },
    "葦": { "kun_sentence": { "text": "[葦](あし)の[葉](は)。", "mean": "갈대 잎." } },
    "糾": { "kun_sentence": { "text": "[不正](ふせい)を[糾](ただ)す。", "mean": "부정을 바로잡다." } },
    "棄": { "kun_sentence": { "text": "[権利](けんり)を[棄](す)てる。", "mean": "권리를 버리다." } },
    "蠍": { "kun_sentence": { "text": "[蠍](さそり)の[毒](どく)。", "mean": "전갈의 독." } },
    "袷": { "kun_sentence": { "text": "[袷](あわせ)を[着](き)る。", "mean": "겹옷(아와세)을 입다." } },
    "桁": { "kun_sentence": { "text": "[橋](はし)の[桁](けた)。", "mean": "다리 대들보(교각)." } },
    "俺": { "kun_sentence": { "text": "[俺](おれ)の[言](い)うことを[聞](き)け。", "mean": "내 말을 들어라." } },
    "薯": { "kun_sentence": { "text": "[薩](さつ)[摩](ま)[薯](いも)を[蒸](む)す。", "mean": "고구마를 찌다." } },
    "袴": { "kun_sentence": { "text": "[袴](はかま)を[履](は)く。", "mean": "하카마를 입다." } },
    "尻": { "kun_sentence": { "text": "[尻](しり)に[火](ひ)がつく。", "mean": "불등에 불이 붙다(매우 다급해지다)." } },
    "裾": { "kun_sentence": { "text": "[松](まつ)の[裾](すそ)。", "mean": "소나무의 아랫가기(성긴 아래쪽 가지)." } },
    "誰": { "kun_sentence": { "text": "[誰](だれ)かれ[問](と)わず。", "mean": "누구 할 것 없이." } },
    "麓": { "kun_sentence": { "text": "[麓](ふもと)の[里](さと)。", "mean": "기슭 마을." } },
    "尻": { "kun_sentence": { "text": "[尻](しり)を[振](ふ)る。", "mean": "엉덩이를 흔들다." } },
    "裾": { "kun_sentence": { "text": "[山](やま)の[裾](すそ)野(の)。", "mean": "산기슭 들판." } },
    "誰": { "kun_sentence": { "text": "[誰](だれ)にでも[親](した)しまれる。", "mean": "누구에게나 친숙해지다(사랑받다)." } }
};

let count = 0;
data.forEach(d => {
    if (fixes[d.kanji]) {
        d.kun_sentence = fixes[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`FINAL manual cleanup for readings vs sentences: ${count} items.`);
