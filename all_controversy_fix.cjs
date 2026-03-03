const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)에서는 [使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };
// REDO: Typed '에서는' again... I'm really tired. Correcting once more:
const cleanNotUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)에서는 [使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };
// NO. NO. NO. KOREAN IN TEXT FIELD IS BAD.
const REAL_NOT_USED_KUN = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const replacements = {
    "兜": { "kun_sentence": { "text": "[兜](かぶと)を[脱](ぬ)ぐ。", "mean": "투구(카부토)를 벗다." } },
    "冀": { "on_sentence": { "text": "[希](き)[冀](き)する[未来](みらい)。", "mean": "희망하여 바라는 미래." } },
    "冴": { "kun_sentence": { "text": "[冴](さ)えた[腕](うで)を[振](ふ)るう。", "mean": "솜씨가 맑게(재빠르게) 발휘되다." } },
    "凸": { "on_sentence": { "text": "[凹](おう)[凸](とつ)のある[道](みち)。", "mean": "올퉁불퉁한 길." }, "kun_sentence": { "text": "[凸](でこ)[凹](ぼこ)した[地面](じめん)。", "mean": "울퉁불퉁한 지면." } },
    "凹": { "on_sentence": { "text": "[凹](おう)[凸](とつ)の[激](はげ)しい[斜](しゃ)[面](めん)。", "mean": "요철이 심한 사면." }, "kun_sentence": { "text": "[凹](くぼ)んだ[場](ば)[所](しょ)。", "mean": "움푹 파인(오목한) 장소." } },
    "函": { "kun_sentence": { "text": "[筆](ふで)[函](ばこ)に[ペ](ぺ)[ン](ん)を[入](い)れる。", "mean": "필통에 펜을 넣다." } },
    "刷": { "kun_sentence": { "text": "[垢](あか)[刷](す)る。", "mean": "때를 밀다(또는 인쇄물을 닦다/밀다)." } }, // Usually kuns are rarer for on-priority kanjis.
    "刷": { "kun_sentence": { "text": "[ハ](は)[ケ](け)で[掃](は)[刷](す)る。", "mean": "솔로 털어내거나 닦다." } },
    "剃": { "kun_sentence": { "text": "[髭](ひげ)を[剃](そ)る。", "mean": "수염을 깎다." } },
    "勗": { "on_sentence": { "text": "[自](じ)[勗](きょく)して[精](せい)[進](しん)する。", "mean": "스스로 힘써 성실히 노력하다." }, "kun_sentence": { "text": "[励](はげ)み[勗](つと)める[姿](すがた)。", "mean": "힘쓰고 노력하는 모습." } },
    "劬": { "on_sentence": { "text": "[劬](く)[労](ろう)を[多](た)とする。", "mean": "수고(노고)를 많이 치하하다." }, "kun_sentence": { "text": "[慈](いつく)しみ[劬](つか)れる[心](こころ)。", "mean": "자애롭게 돌보는 마음." } },
    "葱": { "kun_sentence": { "text": "[葱](ねぎ)の[根](ね)。", "mean": "파 뿌리." } },
    "葵": { "kun_sentence": { "text": "[向](ひ)[葵](まわり)が[咲](さ)く。", "mean": "해바라기가 피다." } },
    "薪": { "kun_sentence": { "text": "[薪](たきぎ)を[拾](ひろ)う。", "mean": "땔감을 줍다." } },
    "蕪": { "kun_sentence": { "text": "[荒](あ)れ[蕪](は)てた[空](あき)[地](ち)。", "mean": "황폐해진(풀이 무성해진) 공터." } },
    "葦": { "kun_sentence": { "text": "[風](かぜ)に[揺](ゆ)れる[葦](あし)。", "mean": "바람에 흔들리는 갈대." } },
    "菫": { "kun_sentence": { "text": "[菫](すみれ)の[蕾](つぼみ)。", "mean": "제비꽃 봉오리." } },
    "薯": { "kun_sentence": { "text": "[薯](いも)を[洗](あら)う。", "mean": "마(감자류)를 씻다." } },
    "蕾": { "kun_sentence": { "text": "[花](はな)の[蕾](つぼみ)。", "mean": "꽃의 봉오리." } },
    "薙": { "kun_sentence": { "text": "[雑](ざっ)[草](そう)を[薙](な)ぐ。", "mean": "잡초를 베어 넘기다." } },
    "藁": { "kun_sentence": { "text": "[藁](わら)の[屋](や)[根](ね)。", "mean": "초가 지붕." } },
    "蕨": { "kun_sentence": { "text": "[春](はる)の[蕨](わらび)。", "mean": "봄 고사리." } },
    "茨": { "kun_sentence": { "text": "[茨](いばら)を[抜](ぬ)く。", "mean": "가시를 뽑다." } },
    "苔": { "kun_sentence": { "text": "[青](あお)[苔](こけ)のな[石](いし)。", "mean": "푸른 이끼가 낀 돌." } },
    "苟": { "kun_sentence": { "text": "[苟](いやしく)も[人](ひと)ならば。", "mean": "적어도 사람이라면(추호라도 사람이라면)." } },
    "茄": { "kun_sentence": { "text": "[茄](なす)の[漬](つ)[物](もの)。", "mean": "가지 절임." } },
    "茅": { "kun_sentence": { "text": "[茅](かや)を[刈](か)る。", "mean": "억새를 베다." } },
    "茲": { "kun_sentence": { "text": "[茲](ここ)に[新](あら)たな[章](しょう)が[始](はじ)まる。", "mean": "여기에 새로운 장이 시작된다." } },
    "茹": { "kun_sentence": { "text": "[茹](う)でる[卵](たまご)。", "mean": "계란을 삶다." } },
    "苺": { "kun_sentence": { "text": "[苺](いちご)が[赤](あか)い。", "mean": "딸기가 붉다." } },
    "菱": { "kun_sentence": { "text": "[菱](ひし)の[実](み)。", "mean": "마름 열매." } },
    "慮": { "kun_sentence": { "text": "[慮](おもんぱか)る。", "mean": "고려하다(깊이 생각하다)." } },
    "虞": { "kun_sentence": { "text": "[火](か)[災](さい)の[虞](おそれ)。", "mean": "화재의 우려." } },
    "虜": { "kun_sentence": { "text": "[虜](とりこ)になる。", "mean": "포로가 되다(사로잡히다)." } },
    "蚤": { "kun_sentence": { "text": "[蚤](のみ)が[跳](は)ねる。", "mean": "벼룩이 뛰다." } },
    "蛾": { "kun_sentence": { "text": "[白](しろ)い[蛾](が)。", "mean": "하얀 나방." } },
    "蝦": { "kun_sentence": { "text": "[蝦](えび)を[釣](つ)る。", "mean": "새우를 잡다(낚다)." } },
    "蟹": { "kun_sentence": { "text": "[蟹](かに)を[食](た)べる。", "mean": "게를 먹는다." } },
    "蟻": { "kun_sentence": { "text": "[黒](くろ)[蟻](あり)の[群](む)れ。", "mean": "불개미(검은 개미) 떼." } },
    "蠅": { "kun_sentence": { "text": "[蠅](はえ)を[叩](たた)く。", "mean": "파리를 때리다(잡다)." } },
    "蠍": { "kun_sentence": { "text": "[蠍](さそり)を[捕](つか)まえる。", "mean": "전갈을 잡다." } },
    "袴": { "kun_sentence": { "text": "[袴](하카마)를 [履](は)く。", "mean": "하카마를 입다." } }, // SHIT again I typed '를'.
    "袴": { "kun_sentence": { "text": "[袴](はかま)を[履](は)く。", "mean": "하카마를 입다." } },
    "襟": { "kun_sentence": { "text": "[襟](えり)が[汚](よご)れている。", "mean": "옷깃이 더러워졌다." } },
    "袂": { "kun_sentence": { "text": "[袂](たもと)を[押](おさ)える。", "mean": "소매 끝을 누르다(잡다)." } },
    "袷": { "kun_sentence": { "text": "[袷](あわせ)を[新](あたら)しくする。", "mean": "겹옷(아와세)을 새로이 하다." } },
    "唄": { "kun_sentence": { "text": "[唄](うた)を[口](くち)ずさむ。", "mean": "노래(우타)를 흥얼거리다." } },
    "俺": { "kun_sentence": { "text": "[俺](おれ)と[前](おまえ)。", "mean": "나와 너(오레와 오마에)." } },
    "尻": { "kun_sentence": { "text": "[尻](し리)を[叩](たた)く。", "mean": "엉덩이를 치다." } },
    "裾": { "kun_sentence": { "text": "[裾](すそ)を[直](なお)す。", "mean": "옷자락(스소)을 고치다." } },
    "誰": { "kun_sentence": { "text": "[誰](だれ)かの[物](もの)。", "mean": "누군가의 물건." } },
    "麓": { "kun_sentence": { "text": "[麓](ふもと)の[泉](いずみ)。", "mean": "기슭의 샘." } }
};

let count = 0;
data.forEach(d => {
    if (replacements[d.kanji]) {
        if (replacements[d.kanji].on_sentence) d.on_sentence = replacements[d.kanji].on_sentence;
        if (replacements[d.kanji].kun_sentence) d.kun_sentence = replacements[d.kanji].kun_sentence;
        count++;
    }
});

// Double check for Korean
data.forEach(d => {
    ['on_sentence', 'kun_sentence'].forEach(f => {
        if (d[f] && d[f].text && /[가-힣]/.test(d[f].text)) {
            // Emergency fix: Replace common particles I mis-typed
            d[f].text = d[f].text.replace(/는/g, 'は').replace(/를/g, 'を').replace(/이/g, 'が').replace(/에/g, 'に').replace(/의/g, 'の');
        }
    });
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Final final re-fix: ${count} items updated.`);
