const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let maxId = Math.max(...data.map(k => k.id));

const newKanjis = [
    {
        "kanji": "幻",
        "meaning": "환상 환",
        "on_reading": "ゲン",
        "kun_reading": "まぼろし",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "작은 실(幺)이 기우뚱하게 꺾인(⺄) 모양에서, 실체가 없는 '환상'을 뜻하게 되었어요.",
        "examples": [
            { "word": "[幻][想](げんそう)", "reading": "げんそう", "mean": "환상 (음독)" },
            { "word": "[幻][覚](げんかく)", "reading": "げんかく", "mean": "환각 (음독)" },
            { "word": "[幻](まぼろし)の[名][盤](めいばん)", "reading": "まぼろしのめいばん", "mean": "환상의 명반 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[幻][想](げんそう)を[抱](いだ)く。", "mean": "환상을 품다." }
        ],
        "kun_sentence": [
            { "text": "[幻](まぼろし)の[国](くに)を[探](さが)す。", "mean": "환상의 나라를 찾다." }
        ]
    },
    {
        "kanji": "枯",
        "meaning": "마를 고",
        "on_reading": "コ",
        "kun_reading": "か.れる/か.らす",
        "category": "N2",
        "subcategory": "자연·식물",
        "explanation": "나무(木)가 오래되어(古) 생기를 잃고 '마르다'는 뜻이에요.",
        "examples": [
            { "word": "[枯][渇](こかつ)", "reading": "こかつ", "mean": "고갈 (음독)" },
            { "word": "[枯](か)れる", "reading": "かれる", "mean": "마르다 (훈독)" },
            { "word": "[枯](か)らす", "reading": "からす", "mean": "말리다 (훈독)" },
            { "word": "[枯][葉](かれは)", "reading": "かれは", "mean": "마른 잎 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[資][源](しげん)が[枯][渇](こかつ)する。", "mean": "자원이 고갈되다." }
        ],
        "kun_sentence": [
            { "text": "[花](はな)が[枯](か)れる。", "mean": "꽃이 마르다." },
            { "text": "[池](いけ)の[水](みず)を[枯](か)らす。", "mean": "연못의 물을 말리다." }
        ]
    },
    {
        "kanji": "雇",
        "meaning": "품팔 고",
        "on_reading": "コ",
        "kun_reading": "やと.う",
        "category": "N2",
        "subcategory": "사회·직업",
        "explanation": "문(戶) 앞에 모여든 새(隹)들을 보살피듯, 사람을 모아 '고용하다'는 뜻이 되었습니다.",
        "examples": [
            { "word": "[雇][用](こよう)", "reading": "こよう", "mean": "고용 (음독)" },
            { "word": "[解][雇](かいこ)", "reading": "かいこ", "mean": "해고 (음독)" },
            { "word": "[雇](やと)う", "reading": "やとう", "mean": "고용하다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[雇][用](こよう)を[創][出](そうしゅつ)する。", "mean": "고용을 창출하다." }
        ],
        "kun_sentence": [
            { "text": "[新](あたら)しい[人](ひと)を[雇](やと)う。", "mean": "새로운 사람을 고용하다." }
        ]
    },
    {
        "kanji": "誇",
        "meaning": "자랑할 과",
        "on_reading": "コ",
        "kun_reading": "ほこ.る",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "말(言)을 크게(大) 꾸며서(亏) 남에게 자신의 능력을 '자랑하다'는 뜻이에요.",
        "examples": [
            { "word": "[誇][張](こちょう)", "reading": "こちょう", "mean": "과장 (음독)" },
            { "word": "[誇](ほこ)る", "reading": "ほこる", "mean": "자랑하다 (훈독)" },
            { "word": "[誇](ほこ)り", "reading": "ほこり", "mean": "자랑/긍지 (훈독)" }
        ],
        "on_sentence": [
            { "text": "その[話](はなし)は[誇][張](こちょう)だ。", "mean": "그 이야기는 과장이다." }
        ],
        "kun_sentence": [
            { "text": "[日][本](にほん)[一](いち)を[誇](ほこ)る。", "mean": "일본 제일을 자랑하다." }
        ]
    },
    {
        "kanji": "悟",
        "meaning": "깨달을 오",
        "on_reading": "ゴ",
        "kun_reading": "さと.る",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "마음(忄) 속에 나(吾) 자신의 본질을 발견하여 '깨닫다'는 의미입니다.",
        "examples": [
            { "word": "[覚][悟](かくご)", "reading": "かくご", "mean": "각오 (음독)" },
            { "word": "[悟](さと)る", "reading": "さとる", "mean": "깨닫다 (훈독)" },
            { "word": "[悟](さと)り", "reading": "さとり", "mean": "깨달음 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[死](し)を[覚][悟](かくご)する。", "mean": "죽음을 각오하다." }
        ],
        "kun_sentence": [
            { "text": "[真][理](しんり)を[悟](さと)る。", "mean": "진리를 깨닫다." }
        ]
    },
    {
        "kanji": "娯",
        "meaning": "즐길 오",
        "on_reading": "ゴ",
        "kun_reading": "-",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "여자(女)가 춤을 추며 즐겁게 놀 듯, 사람의 마음을 '즐겁게 하다'는 뜻이에요.",
        "examples": [
            { "word": "[娯][楽](ごらく)", "reading": "ごらく", "mean": "오락 (음독)" }
        ],
        "on_sentence": [
            { "text": "[娯][楽](ごらく)[施][設](しせつ)へ[行](い)く。", "mean": "오락 시설에 가다." }
        ],
        "kun_sentence": []
    },
    {
        "kanji": "巧",
        "meaning": "공교할 교",
        "on_reading": "コウ",
        "kun_reading": "たく.み",
        "category": "N1",
        "subcategory": "동작·기술",
        "explanation": "장인(工)이 숨을 고르며(丂) 정교하게 물건을 만드는 모습에서 '정교하다, 솜씨가 좋다'는 뜻이 되었습니다.",
        "examples": [
            { "word": "[精][巧](せいこう)", "reading": "せいこう", "mean": "정교 (음독)" },
            { "word": "[巧][妙](こうみょう)", "reading": "こうみょう", "mean": "교묘함 (음독)" },
            { "word": "[巧](たく)み", "reading": "たくみ", "mean": "솜씨가 훌륭함 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[精][巧](せいこう)な[機][械](きかい)だ。", "mean": "정교한 기계이다." }
        ],
        "kun_sentence": [
            { "text": "[巧](たく)みな[話](はな)し[方](かた)。", "mean": "훌륭한 말솜씨." }
        ]
    },
    {
        "kanji": "剛",
        "meaning": "굳셀 강",
        "on_reading": "ゴウ",
        "kun_reading": "-",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "단단한 산(岡)과 칼(刀)의 만남으로, '굳세고 단단함'을 표현했어요.",
        "examples": [
            { "word": "[強][剛](きょうごう)", "reading": "きょうごう", "mean": "강건함 (음독)" },
            { "word": "[剛][慢](ごうまん)", "reading": "ごうまん", "mean": "오만함 (음독)" } // 거만, 강경
        ],
        "on_sentence": [
            { "text": "[強][剛](きょうごう)な[肉][体](にくたい)だ。", "mean": "강건한 육체이다." }
        ],
        "kun_sentence": []
    },
    {
        "kanji": "克",
        "meaning": "이길 극",
        "on_reading": "コク",
        "kun_reading": "-",
        "category": "N1",
        "subcategory": "동작·이동",
        "explanation": "머리에 투구(古 모습의 변형)를 쓰고 걷는(儿) 장수의 모습으로 어려움을 '이겨내다'는 뜻입니다.",
        "examples": [
            { "word": "[克][服](こくふく)", "reading": "こくふく", "mean": "극복 (음독)" },
            { "word": "[克][己](こっき)", "reading": "こっき", "mean": "극기 (음독)" }
        ],
        "on_sentence": [
            { "text": "[弱][点](じゃくてん)を[克][服](こくふく)する。", "mean": "약점을 극복하다." }
        ],
        "kun_sentence": []
    },
    {
        "kanji": "恨",
        "meaning": "한할 한",
        "on_reading": "コン",
        "kun_reading": "うら.む/うら.めしい",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "마음(忄) 속에 멈춰(艮) 응어리진 감정. 누군가를 '원망하다'는 뜻이에요.",
        "examples": [
            { "word": "[痛][恨](つうこん)", "reading": "つうこん", "mean": "통한 (음독)" },
            { "word": "[恨](うら)む", "reading": "うらむ", "mean": "원망하다 (훈독)" },
            { "word": "[恨](うら)めしい", "reading": "うらめしい", "mean": "원망스럽다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[痛][恨](つうこん)の[極](きわ)みだ。", "mean": "원통함의 극치이다." }
        ],
        "kun_sentence": [
            { "text": "[人](ひと)を[恨](うら)む。", "mean": "사람을 원망하다." },
            { "text": "[目](め)つきが[恨](うら)めしい。", "mean": "눈빛이 원망스럽다." }
        ]
    },
    {
        "kanji": "墾",
        "meaning": "개간할 간",
        "on_reading": "コン",
        "kun_reading": "-",
        "category": "N1",
        "subcategory": "자연·식물",
        "explanation": "짐승(豸)이 땅(土)을 마구 파헤치는 모습에서 단단한 땅을 '개간하다'는 의미가 되었어요.",
        "examples": [
            { "word": "[開][墾](かいこん)", "reading": "かいこん", "mean": "개간 (음독)" }
        ],
        "on_sentence": [
            { "text": "[荒][地](あれち)を[開][墾](かいこん)する。", "mean": "황무지를 개간하다." }
        ],
        "kun_sentence": []
    },
    {
        "kanji": "錯",
        "meaning": "어긋날 착",
        "on_reading": "サク",
        "kun_reading": "-",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "쇠붙이(金)를 서로 교차시켜(昔) 놓은 모양에서, 엇갈리거나 '어긋나다'는 의미가 나왔습니다.",
        "examples": [
            { "word": "[錯][覚](さっかく)", "reading": "さっかく", "mean": "착각 (음독)" },
            { "word": "[交][錯](こうさく)", "reading": "こうさく", "mean": "교착 (음독)" }
        ],
        "on_sentence": [
            { "text": "[目](め)の[錯][覚](さっかく)だ。", "mean": "눈의 착각이다." }
        ],
        "kun_sentence": []
    },
    {
        "kanji": "撮",
        "meaning": "찍을 촬",
        "on_reading": "サツ",
        "kun_reading": "と.る",
        "category": "N2",
        "subcategory": "동작·기술",
        "explanation": "손(扌)으로 빛이나 풍경을 한데 모아서(最) 사진으로 '찍다'는 의미를 나타냅니다.",
        "examples": [
            { "word": "[撮][影](さつえい)", "reading": "さつえい", "mean": "촬영 (음독)" },
            { "word": "[写][真](しゃしん)を[撮](と)る", "reading": "しゃしんをとる", "mean": "사진을 찍다 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[映][画](えいが)を[撮][影](さつえい)する。", "mean": "영화를 촬영하다." }
        ],
        "kun_sentence": [
            { "text": "[写][真](しゃしん)を[撮](と)る。", "mean": "사진을 찍다." }
        ]
    },
    {
        "kanji": "暫",
        "meaning": "잠깐 잠",
        "on_reading": "ザン",
        "kun_reading": "しばら.く",
        "category": "N1",
        "subcategory": "시간",
        "explanation": "해가(日) 칼날(斬)로 잘라낸 것처럼 아주 짧게 떠 있는 '잠깐'의 시간을 뜻해요.",
        "examples": [
            { "word": "[暫][定](ざんてい)", "reading": "ざんてい", "mean": "잠정 (음독)" },
            { "word": "[暫](しばら)く", "reading": "しばらく", "mean": "잠시 (훈독)" }
        ],
        "on_sentence": [
            { "text": "[暫][定](ざんてい)の[結][果](けっか)。", "mean": "잠정 결과." }
        ],
        "kun_sentence": [
            { "text": "[暫](しばら)くお[待](ま)ちください。", "mean": "잠시 기다려주세요." }
        ]
    },
    {
        "kanji": "旨",
        "meaning": "뜻 지",
        "on_reading": "シ",
        "kun_reading": "むね",
        "category": "N1",
        "subcategory": "추상·심리",
        "explanation": "맛있는 고기를 입(口)에 머금으려는 마음, 즉 사람의 깊은 '생각, 취지'를 나타냅니다.",
        "examples": [
            { "word": "[要][旨](ようし)", "reading": "ようし", "mean": "요지 (음독)" },
            { "word": "その[旨](むね)", "reading": "そのむね", "mean": "그 뜻 (훈독)" } // Not strictly a compound, but highly useful
        ],
        "on_sentence": [
            { "text": "[議][題](ぎだい)の[要][旨](ようし)をまとめる。", "mean": "의제의 요지를 정리하다." }
        ],
        "kun_sentence": [
            { "text": "その[旨](むね)を[伝](つた)える。", "mean": "그 취지를 전하다." }
        ]
    }
];

let added = 0;
for (const raw of newKanjis) {
    if (!data.some(k => k.kanji === raw.kanji)) {
        maxId++;
        raw.id = maxId;
        data.push(raw);
        added++;
    }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Successfully added ${added} new high-quality Kanji.`);
