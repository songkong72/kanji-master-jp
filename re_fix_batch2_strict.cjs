const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)는 [通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };
// Wait, I just typed '는' (Korean) in notUsedKun. MEANING IS KOREAN, TEXT MUST BE JAPANESE.
const correctNotUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const updates = {
    "偽": {
        "on_sentence": { "text": "[虚偽](きょぎ)の[証言](しょうげん)をすることは[犯罪](はんざい)だ。", "mean": "허위 증언을 하는 것은 범죄다." },
        "kun_sentence": { "text": "この[名画](めいが)は[偽物](にせもの)だ。", "mean": "이 명화는 가짜다." }
    },
    "兔": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[森](もり)の[中](なか)に[野兎](のうさぎ)が[隠](かく)れている。", "mean": "숲속에 산토끼가 숨어 있다." }
    },
    "兇": {
        "on_sentence": { "text": "[兇悪](きょうあく)な[事件](じけん)に[警戒](けいかい)する。", "mean": "흉악한 사건에 경계하다." },
        "kun_sentence": correctNotUsedKun
    },
    "勁": {
        "on_sentence": { "text": "[勁烈](けいれつ)な[意志](いし)を[持](も)ち[続](つづ)ける。", "mean": "강렬한 의지를 계속 가지다." },
        "kun_sentence": correctNotUsedKun
    },
    "劭": {
        "on_sentence": { "text": "[劭勉](しょうべん)の[末](すえ)に[成功](せいこう)した。", "mean": "힘써 노력한 끝에 성공했다." },
        "kun_sentence": { "text": "[学](まな)びに[劭](つと)める[姿](すがた)が[美](うつく)しい。", "mean": "배움에 힘쓰는 모습이 아름답다." }
    },
    // Batch 2 (Problematic ones)
    "闇": {
        "on_sentence": { "text": "[一寸](いっすん)[先](さき)は[闇](やみ)だ。", "mean": "한 치 앞은 어둠이다." },
        "kun_sentence": { "text": "[闇](やみ)の[中](なか)に[消](き)えていった。", "mean": "어둠 속으로 사라져 갔다." }
    },
    "椅": {
        "on_sentence": { "text": "[座](すわ)り[心地](ごこち)のいい[椅子](いす)を[買](か)う。", "mean": "앉기 편한 의자를 사다." },
        "kun_sentence": correctNotUsedKun
    },
    "彙": {
        "on_sentence": { "text": "[語彙](ごい)を[豊](ゆた)かにするために[読書](どくしょ)する。", "mean": "어휘를 풍부하게 하기 위해 독서한다." },
        "kun_sentence": correctNotUsedKun
    },
    "臼": {
        "on_sentence": { "text": "[石臼](いしうす)で[粉](こな)を[挽](ひ)く。", "mean": "맷돌로 가루를 갈다." },
        "kun_sentence": { "text": "[臼](うす)を[使](つか)って[餅](もち)を[搗](つ)く。", "mean": "절구를 사용하여 떡을 치다." }
    },
    "唄": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[三味線](しゃみせん)に合わせて[長唄](ながうた)を[歌](うた)う。", "mean": "샤미센에 맞춰 나가우타(긴 노래)를 부르다." }
    },
    "怨": {
        "on_sentence": { "text": "[怨恨](えんこん)による[犯行](はんこう)と[推測](すいそく)される。", "mean": "원한에 의한 범행으로 추측된다." },
        "kun_sentence": { "text": "[運命](うんめい)を[怨](うら)む。", "mean": "운명을 원망하다." }
    },
    "艶": {
        "on_sentence": { "text": "[艶やか](あでやか)な[着物](きもの)が[似合](にあ)う。", "mean": "화사한(요염한) 기모노가 어울린다." },
        "kun_sentence": { "text": "[艶](つや)のある[髪](かみ)を[持](も)っている。", "mean": "윤기 있는 머리카락을 가지고 있다." }
    },
    "旺": {
        "on_sentence": { "text": "[旺盛](おうせい)な[食欲](しょくよく)に[驚](おどろ)く。", "mean": "왕성한 식욕에 놀라다." },
        "kun_sentence": correctNotUsedKun
    },
    "岡": {
        "on_sentence": { "text": "[静岡](しずおか)の[名物](めいぶつ)はお[茶](ちゃ)だ。", "mean": "시즈오카의 명물은 차다." },
        "kun_sentence": { "text": "[岡](おか)を[登](のぼ)って[景色](けしき)を[眺](なが)める。", "mean": "언덕을 올라 경치를 바라본다." }
    },
    "臆": {
        "on_sentence": { "text": "[臆病](おくびょう)な[性格](せいかく)を[克服](こくふく)する。", "mean": "겁이 많은 성격을 극복하다." },
        "kun_sentence": { "text": "[臆](おく)することなく[意見](いけん)を[述](の)べる。", "mean": "겁내는 것 없이 의견을 말하다." }
    },
    "俺": {
        "on_sentence": notUsedOn,
        "kun_sentence": { "text": "[俺](おれ)の[言](い)うことを[信](しん)じてくれ。", "mean": "내(나) 말을 믿어줘." }
    },
    "拐": {
        "on_sentence": { "text": "[子供](こども)が[誘拐](ゆうかい)される[事件](じけん)。", "mean": "아이가 유괴되는 사건." },
        "kun_sentence": correctNotUsedKun
    },
    "崖": {
        "on_sentence": { "text": "[断崖](だんがい)[絶壁](ぜっぺき)に[立](た)つ。", "mean": "단애절벽에 서다." },
        "kun_sentence": { "text": "[崖](がけ)から[転落](てんらく)しないよう[注意](ちゅうい)する。", "mean": "절벽에서 추락하지 않도록 주의하다." }
    },
    "鎧": {
        "on_sentence": { "text": "[武士](ぶし)が[重](おも)い[鎧](よろい)を[着](き)る。", "mean": "무사가 무거운 갑옷을 입다." },
        "kun_sentence": { "text": "[身体](からだ)に[鎧](よろい)を[纏](まと)う。", "mean": "몸에 갑옷을 걸치다." }
    },
    "喝": {
        "on_sentence": { "text": "[大声](おおごえ)で[一喝](いっかつ)する。", "mean": "큰 소리로 일갈하다." },
        "kun_sentence": correctNotUsedKun
    },
    "鎌": {
        "on_sentence": { "text": "[鎌倉](かまくら)の[大仏](だいぶつ)を[見](み)に行く。", "mean": "가마쿠라의 대불을 보러 가다." },
        "kun_sentence": { "text": "[鎌](かま)で[稲](いね)を[刈](か)る。", "mean": "낫으로 벼를 베다." }
    },
    "粥": {
        "on_sentence": { "text": "[健康](けんこう)のために[七草](ななくさ)[粥](がゆ)を[食](た)べる。", "mean": "건강을 위해 나나쿠사가유(일곱가지 풀죽)를 먹는다." },
        "kun_sentence": { "text": "[胃](い)を[休](やす)めるために[粥](かゆ)を[作](つく)る。", "mean": "위를 쉬게 하기 위해 죽을 만들다." }
    },
    "伎": {
        "on_sentence": { "text": "[歌舞伎](かぶき)を[鑑賞](かんしょう)する。", "mean": "가부키를 감상하다." },
        "kun_sentence": correctNotUsedKun
    }
};

let count = 0;
data.forEach(d => {
    if (updates[d.kanji]) {
        d.on_sentence = updates[d.kanji].on_sentence;
        d.kun_sentence = updates[d.kanji].kun_sentence;

        // Check for Korean in the fixed text field
        if (/[가-힣]/.test(d.on_sentence.text) || /[가-힣]/.test(d.kun_sentence.text)) {
            throw new Error(`KOREAN DETECTED in fix for ${d.kanji}`);
        }
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Remediation Batch 2 applied: ${count} kanjis.`);
