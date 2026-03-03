const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let maxId = Math.max(...data.map(k => k.id));

const newKanjis = [
    {
        "kanji": "柔",
        "meaning": "부드러울 유",
        "on_reading": "ジュウ/ニュウ",
        "kun_reading": "やわ.らかい/やわ.らか",
        "category": "N3",
        "subcategory": "상태·성질",
        "explanation": "창(矛)에 찔려도 부러지지 않고 휘어지는 나무(木)처럼 '부드럽다'는 뜻입니다.",
        "examples": [
            { "word": "[柔][道](じゅうどう)", "reading": "じゅうどう", "mean": "유도 (음독)" },
            { "word": "[優][柔](ゆうじゅう)", "reading": "ゆうじゅう", "mean": "우유부단함 (음독)" },
            { "word": "[柔](やわ)らかい", "reading": "やわらかい", "mean": "부드럽다 (훈독)" },
            { "word": "[柔](やわ)らかな", "reading": "やわらかな", "mean": "부드러운 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[柔][道](じゅうどう)の[達][人](たつじん)だ。", "mean": "유도의 달인이다." },
            { "text": "[優][柔](ゆうじゅう)な[態][度](たいど)。", "mean": "우유부단한 태도." }
        ],
        "kun_sentence": [
            { "text": "[柔](やわ)らかい[布](ぬの)で[拭](ふ)く。", "mean": "부드러운 천으로 닦다." },
            { "text": "[柔](やわ)らかな[日][差](ひざ)し。", "mean": "부드러운 햇살." }
        ]
    },
    {
        "kanji": "駐",
        "meaning": "머무를 주",
        "on_reading": "チュウ",
        "kun_reading": "-",
        "category": "N3",
        "subcategory": "동작·이동",
        "explanation": "말(馬)이 주인(主)의 명령에 따라 제자리에 '머무르다'라는 뜻입니다.",
        "examples": [
            { "word": "[駐][車](ちゅうしゃ)", "reading": "ちゅうしゃ", "mean": "주차 (음독)" },
            { "word": "[駐][在](ちゅうざい)", "reading": "ちゅうざい", "mean": "주재 (음독)" }
        ],
        "on_sentence": [
            { "text": "[車](くるま)を[駐][車](ちゅうしゃ)する。", "mean": "차를 주차하다." }
        ],
        "kun_sentence": []
    },
    {
        "kanji": "捨",
        "meaning": "버릴 사",
        "on_reading": "シャ",
        "kun_reading": "す.てる",
        "category": "N3",
        "subcategory": "동작·이동",
        "explanation": "손(扌)으로 쓸모없는 것을 집어(舎) 밖으로 '버리다'라는 뜻이에요.",
        "examples": [
            { "word": "[四][捨](ししゃ)", "reading": "ししゃ", "mean": "사사 (음독)" },
            { "word": "[捨](す)てる", "reading": "すてる", "mean": "버리다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[四][捨][五][入](ししゃごにゅう)する。", "mean": "사사오입(반올림)하다." }
        ],
        "kun_sentence": [
            { "text": "[道](みち)に[入][紙](ごみ)を[捨](す)てる。", "mean": "길에 쓰레기를 버리다." }
        ]
    },
    {
        "kanji": "沈",
        "meaning": "잠길 침",
        "on_reading": "チン",
        "kun_reading": "しず.む/しず.める",
        "category": "N3",
        "subcategory": "동작·상태",
        "explanation": "물(氵) 속으로 무거운 것(冘)이 가라앉아 '잠기다'라는 뜻이 되었습니다.",
        "examples": [
            { "word": "[沈][黙](ちんもく)", "reading": "ちんもく", "mean": "침묵 (음독)" },
            { "word": "[沈](しず)む", "reading": "しずむ", "mean": "가라앉다 (훈독)" },
            { "word": "[沈](しず)める", "reading": "しずめる", "mean": "가라앉히다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[重](おも)い[沈][黙](ちんもく)が[続](つづ)く。", "mean": "무거운 침묵이 계속되다." }
        ],
        "kun_sentence": [
            { "text": "[船](ふね)が[海](うみ)に[沈](しず)む。", "mean": "배가 바다에 가라앉다." },
            { "text": "[気][持](きも)ちを[静](しず)める。", "mean": "마음을 가라앉히다." }
        ]
    },
    {
        "kanji": "浮",
        "meaning": "뜰 부",
        "on_reading": "フ",
        "kun_reading": "う.く/う.かぶ",
        "category": "N3",
        "subcategory": "동작·상태",
        "explanation": "물(氵) 위로 아기(子)를 안은(爪) 사람이 '뜨다'라는 모습을 본뜬 글자예요.",
        "examples": [
            { "word": "[浮][力](ふりょく)", "reading": "ふりょく", "mean": "부력 (음독)" },
            { "word": "[浮](う)く", "reading": "うく", "mean": "뜨다 (훈독)" },
            { "word": "[浮](う)かぶ", "reading": "うかぶ", "mean": "떠오르다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[浮][力](ふりょく)を[計][算](けいさん)する。", "mean": "부력을 계산하다." }
        ],
        "kun_sentence": [
            { "text": "[体](からだ)が[水](みず)に[浮](う)く。", "mean": "몸이 물에 뜨다." },
            { "text": "[空](そら)に[雲](くも)が[浮](う)かぶ。", "mean": "하늘에 구름이 떠오르다." }
        ]
    },
    {
        "kanji": "鳴",
        "meaning": "울 명",
        "on_reading": "メイ",
        "kun_reading": "な.く/な.る/な.らす",
        "category": "N3",
        "subcategory": "자연·소리",
        "explanation": "새(鳥)가 부리(口)를 벌려 소리내어 '울다'라는 뜻입니다.",
        "examples": [
            { "word": "[悲][鳴](ひめい)", "reading": "ひめい", "mean": "비명 (음독)" },
            { "word": "[鳴](な)く", "reading": "なく", "mean": "울다 (동물) (훈독)" },
            { "word": "[鳴](な)る", "reading": "なる", "mean": "울리다 (자동사) (훈독)" },
            { "word": "[鳴](な)らす", "reading": "ならす", "mean": "울리다 (타동사) (훈독)" }
        ],
        "on_sentence": [
            { "text": "[悲][鳴](ひめい)を[上](あ)げる。", "mean": "비명을 지르다." }
        ],
        "kun_sentence": [
            { "text": "[犬](いぬ)が[鳴](な)く。", "mean": "개가 울다(짖다)." },
            { "text": "[電][話](でんわ)が[鳴](な)る。", "mean": "전화가 울리다." },
            { "text": "[車](くるま)のクラクションを[鳴](な)らす。", "mean": "차의 경적을 울리다." }
        ]
    },
    {
        "kanji": "塗",
        "meaning": "칠할 도",
        "on_reading": "ト",
        "kun_reading": "ぬ.る",
        "category": "N3",
        "subcategory": "동작·기술",
        "explanation": "흙(土)이나 물기(氵) 있는 칠감(余)을 마구 '칠하다'라는 의미입니다.",
        "examples": [
            { "word": "[塗][装](とそう)", "reading": "とそう", "mean": "도장 (음독)" },
            { "word": "[塗](ぬ)る", "reading": "ぬる", "mean": "칠하다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[塗][料](とりょう)で[塗][装](とそう)する。", "mean": "도료로 도장(페인트칠)하다." }
        ],
        "kun_sentence": [
            { "text": "パンにバターを[塗](ぬ)る。", "mean": "빵에 버터를 바르다." }
        ]
    },
    {
        "kanji": "抜",
        "meaning": "뺄 발",
        "on_reading": "バツ",
        "kun_reading": "ぬ.く/ぬ.ける",
        "category": "N3",
        "subcategory": "동작·이동",
        "explanation": "손(扌)으로 벗(友)의 가시 등 불필요한 것을 쭉 '빼다'라는 뜻이에요.",
        "examples": [
            { "word": "[抜][群](ばつぐん)", "reading": "ばつぐん", "mean": "발군/뛰어남 (음독)" },
            { "word": "[抜](ぬ)く", "reading": "ぬく", "mean": "뽑다 (훈독)" },
            { "word": "[抜](ぬ)ける", "reading": "ぬける", "mean": "빠지다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[成][績](せいせき)が[抜][群](ばつぐん)だ。", "mean": "성적이 발군(매우 뛰어남)이다." }
        ],
        "kun_sentence": [
            { "text": "[歯](は)を[抜](ぬ)く。", "mean": "이를 뽑다." },
            { "text": "[髪](かみ)が[抜](ぬ)ける。", "mean": "머리카락이 빠지다." }
        ]
    },
    {
        "kanji": "折",
        "meaning": "꺾을 절",
        "on_reading": "セツ",
        "kun_reading": "お.る/お.れる",
        "category": "N3",
        "subcategory": "동작·상태",
        "explanation": "손(扌)에 쥔 도끼(斤)로 나뭇가지를 '꺾다'는 의미입니다.",
        "examples": [
            { "word": "[挫][折](ざせつ)", "reading": "ざせつ", "mean": "좌절 (음독)" },
            { "word": "[折](お)る", "reading": "おる", "mean": "꺾다/접다 (훈독)" },
            { "word": "[折](お)れる", "reading": "おれる", "mean": "꺾이다/부러지다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[夢](ゆめ)に[挫][折](ざせつ)する。", "mean": "꿈에 좌절하다." }
        ],
        "kun_sentence": [
            { "text": "[紙](かみ)を[二](ふた)つに[折](お)る。", "mean": "종이를 두 개로 접다." },
            { "text": "[強](つよ)い[風](かぜ)で[枝](えだ)が[折](お)れる。", "mean": "강한 바람에 가지가 꺾이다." }
        ]
    },
    {
        "kanji": "怒",
        "meaning": "성낼 노",
        "on_reading": "ド",
        "kun_reading": "いか.る/おこ.る",
        "category": "N3",
        "subcategory": "추상·심리",
        "explanation": "계집종(奴)이 화난 마음(心)으로 '성내다'라는 뜻입니다.",
        "examples": [
            { "word": "[激][怒](げきど)", "reading": "げきど", "mean": "격노 (음독)" },
            { "word": "[怒](いか)る", "reading": "いかる", "mean": "노여워하다 (훈독)" },
            { "word": "[怒](おこ)る", "reading": "おこる", "mean": "화내다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[父](ちち)が[激][怒](げきど)する。", "mean": "아버지가 격노하다." }
        ],
        "kun_sentence": [
            { "text": "[民][衆](みんしゅう)が[怒](いか)る。", "mean": "민중이 노여워하다." },
            { "text": "[友][達](ともだち)が[怒](おこ)る。", "mean": "친구가 화를 내다." }
        ]
    },
    {
        "kanji": "悲",
        "meaning": "슬플 비",
        "on_reading": "ヒ",
        "kun_reading": "かな.しい/かな.しむ",
        "category": "N3",
        "subcategory": "추상·심리",
        "explanation": "새의 양날개(非 - 아닐 비)가 꺾인 모양처럼 마음(心)이 '슬프다'는 의미예요.",
        "examples": [
            { "word": "[悲][劇](ひげき)", "reading": "ひげき", "mean": "비극 (음독)" },
            { "word": "[悲](かな)しい", "reading": "かなしい", "mean": "슬프다 (훈독)" },
            { "word": "[悲](かな)しむ", "reading": "かなしむ", "mean": "슬퍼하다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "これは[悲][劇](ひげき)だ。", "mean": "이것은 비극이다." }
        ],
        "kun_sentence": [
            { "text": "[悲](かな)しい[知](し)らせ。", "mean": "슬픈 소식." },
            { "text": "[友](とも)の[死](し)を[悲](かな)しむ。", "mean": "친구의 죽음을 슬퍼하다." }
        ]
    },
    {
        "kanji": "泣",
        "meaning": "울 읍",
        "on_reading": "キュウ",
        "kun_reading": "な.く",
        "category": "N3",
        "subcategory": "추상·심리",
        "explanation": "사람이 서서(立) 눈물(氵)을 뚝뚝 흘리며 '울다'라는 뜻입니다.",
        "examples": [
            { "word": "[号][泣](ごうきゅう)", "reading": "ごうきゅう", "mean": "오열 (음독)" },
            { "word": "[泣](な)く", "reading": "なく", "mean": "울다 (사람) (훈독)" }
        ],
        "on_sentence": [
            { "text": "[大][声](おおごえ)で[号][泣](ごうきゅう)する。", "mean": "큰 소리로 오열하다." }
        ],
        "kun_sentence": [
            { "text": "[子][供](こども)が[泣](な)く。", "mean": "아이가 울다." }
        ]
    },
    {
        "kanji": "喜",
        "meaning": "기쁠 희",
        "on_reading": "キ",
        "kun_reading": "よろこ.ぶ",
        "category": "N3",
        "subcategory": "추상·심리",
        "explanation": "음악과 북(壴) 소리에 맞춰 웃는 입(口) 모양으로 '기쁘다'는 뜻을 가집니다.",
        "examples": [
            { "word": "[歓][喜](かんき)", "reading": "かんき", "mean": "환희 (음독)" },
            { "word": "[喜](よろこ)ぶ", "reading": "よろこぶ", "mean": "기뻐하다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[歓][喜](かんき)の[声](こえ)をあげる。", "mean": "환희의 소리를 지르다." }
        ],
        "kun_sentence": [
            { "text": "[大][変](たいへん)[喜](よろこ)ぶ。", "mean": "매우 기뻐하다." }
        ]
    },
    {
        "kanji": "泥",
        "meaning": "진흙 니",
        "on_reading": "デイ",
        "kun_reading": "どろ",
        "category": "N3",
        "subcategory": "자연·식물",
        "explanation": "물(氵)가에 스님(尼)이 쓰다 남은 부드러운 흙, 즉 '진흙'을 의미합니다.",
        "examples": [
            { "word": "[泥][酔](でいすい)", "reading": "でいすい", "mean": "만취 (음독)" },
            { "word": "[泥][棒](どろぼう)", "reading": "どろぼう", "mean": "도둑 (훈독)" } // Dorobou is ateji usually but counts as kunyomi-based compound here for learning
        ],
        "on_sentence": [
            { "text": "[泥][酔](でいすい)して[帰](かえ)る。", "mean": "만취해서 돌아가다." }
        ],
        "kun_sentence": [
            { "text": "[泥][棒](どろぼう)を[捕](つか)まえる。", "mean": "도둑을 잡다." }
        ]
    },
    {
        "kanji": "壁",
        "meaning": "벽 벽",
        "on_reading": "ヘキ",
        "kun_reading": "かべ",
        "category": "N3",
        "subcategory": "장소·건축",
        "explanation": "흙(土)을 단단하게 파벽(辟)처럼 쌓아 올린 '벽'이라는 뜻이에요.",
        "examples": [
            { "word": "[絶][壁](ぜっぺき)", "reading": "ぜっぺき", "mean": "절벽 (음독)" },
            { "word": "[壁][紙](かべがみ)", "reading": "かべがみ", "mean": "벽지 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[絶][壁](ぜっぺき)を[登](のぼ)る。", "mean": "절벽을 오르다." }
        ],
        "kun_sentence": [
            { "text": "[部屋](へや)の[壁][紙](かべがみ)を[替](か)える。", "mean": "방의 벽지를 교체하다." }
        ]
    },
    {
        "kanji": "汗",
        "meaning": "땀 한",
        "on_reading": "カン",
        "kun_reading": "あせ",
        "category": "N3",
        "subcategory": "인체·생리",
        "explanation": "물(氵)처럼 방패(干)에서 새어나오는 액체로, 몸에서 흐르는 '땀'을 의미해요.",
        "examples": [
            { "word": "[発][汗](はっかん)", "reading": "はっかん", "mean": "발한 (음독)" },
            { "word": "[汗][水](あせみず)", "reading": "あせみず", "mean": "땀물 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[発][汗](はっかん)[作][用](さくよう)がある。", "mean": "발한(땀이 남) 작용이 있다." }
        ],
        "kun_sentence": [
            { "text": "[汗][水](あせみず)を流(なが)す。", "mean": "땀물을 흘리다." }
        ]
    },
    {
        "kanji": "涙",
        "meaning": "눈물 루",
        "on_reading": "ルイ",
        "kun_reading": "なみだ",
        "category": "N3",
        "subcategory": "인체·생리",
        "explanation": "눈(目)을 되돌리며(戻) 물(氵)처럼 흘리는 액체, '눈물'입니다.",
        "examples": [
            { "word": "[感][涙](かんるい)", "reading": "かんるい", "mean": "감루/감동의 눈물 (음독)" },
            { "word": "[涙][声](なみだごえ)", "reading": "なみだごえ", "mean": "울음 섞인 목소리 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[感][涙](かんるい)に[咽](むせ)ぶ。", "mean": "감루에 목이 메다." }
        ],
        "kun_sentence": [
            { "text": "[涙][声](なみだごえ)で[話](はな)す。", "mean": "울음 섞인 목소리로 말하다." }
        ]
    },
    {
        "kanji": "血",
        "meaning": "피 혈",
        "on_reading": "ケツ",
        "kun_reading": "ち",
        "category": "N3",
        "subcategory": "인체·생리",
        "explanation": "그릇(皿)에 담긴 동물의 붉은 '피'를 본뜬 상형문자입니다.",
        "examples": [
            { "word": "[血][液](けつえき)", "reading": "けつえき", "mean": "혈액 (음독)" },
            { "word": "[鼻][血](はなぢ)", "reading": "はなぢ", "mean": "코피 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[血][液](けつえき)[型](がた)を[調](しら)べる。", "mean": "혈액형을 조사하다." }
        ],
        "kun_sentence": [
            { "text": "[鼻][血](はなぢ)が[出](で)た。", "mean": "코피가 났다." }
        ]
    }
];

let addedCount = 0;
newKanjis.forEach(raw => {
    // Prevent duplicates
    if (!data.some(k => k.kanji === raw.kanji)) {
        maxId++;
        raw.id = maxId;
        data.push(raw);
        addedCount++;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Successfully added ${addedCount} kanjis in Batch 2.`);
