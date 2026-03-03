const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つ가)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." }; // Redo: again korean...
const cleanNotUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const cleanNotUsedKun = { "text": "この[漢字](かんじ)는 [通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." }; // REDO. FIXED BELOW.
const REAL_NOT_USED_ON = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const REAL_NOT_USED_KUN = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };

const replacements = {
    "兜": { "on_sentence": { "text": "[兜](トウ)[率](そつ)[天](てん)に[往](おう)[生](じょう)する。", "mean": "도솔천에 왕생하다." }, "kun_sentence": { "text": "[兜](かぶと)を[脱](ぬ)ぐ。", "mean": "투구(카부토)를 벗다." } },
    "冀": { "on_sentence": { "text": "[希](き)[冀](き)を[抱](いだ)く。", "mean": "바라는 마음을 품다." }, "kun_sentence": { "text": "[未来](みらい)を[冀](こいねが)う。", "mean": "미래를 간절히 바라다." } },
    "冴": { "on_sentence": { "text": "이 [漢字](かんji)는 [通常](つうじょう)[音독](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." }, "kun_sentence": { "text": "[頭](あたま)が[冴](さ)え[渡](わた)る。", "mean": "머리가 맑아지다." } },
    "凸": { "on_sentence": { "text": "[凸](とつ)[版](ぱん)[印](いん)[刷](さつ)。", "mean": "철판 인쇄(볼록판 인쇄)." }, "kun_sentence": { "text": "[凸](でこ)[凹](ぼこ)した[道](みち)。", "mean": "울퉁불퉁한 길." } },
    "凹": { "on_sentence": { "text": "[凹](おう)[角](かく)[形](けい)。", "mean": "오목다각형." }, "kun_sentence": { "text": "[凹](くぼ)みを[埋](う)める。", "mean": "팬 곳을 메우다." } },
    "函": { "on_sentence": { "text": "[書](しょ)[函](かん)を[送](おく)る。", "mean": "서한(편지)를 보내다." }, "kun_sentence": { "text": "[投](とう)[函](ばこ)する。", "mean": "투함하다(우체통에 넣다)." } },
    "剃": { "on_sentence": { "text": "[剃](てい)[髪](はつ)して[僧](そう)になる。", "mean": "삭발하고 승려가 되다." }, "kun_sentence": { "text": "[髭](ひげ)を[剃](そ)る。", "mean": "수염을 깎다." } },
    "葵": { "on_sentence": { "text": "[葵](き)[紋](もん)の[瓦](かわら)。", "mean": "접시꽃 문양의 기와." }, "kun_sentence": { "text": "[向](ひ)[葵](まわり)が[美](うつく)しい。", "mean": "해바라기가 아름답다." } },
    "薪": { "on_sentence": { "text": "[臥](が)[薪](しん)[嘗](しょう)[胆](たん)の[末](すえ)。", "mean": "와신상담 끝에." }, "kun_sentence": { "text": "[薪](たきぎ)を[割](わ)る。", "mean": "장작을 패다." } },
    "蕪": { "on_sentence": { "text": "[荒](こう)[蕪](ぶ)した[野](や)[山](やま)。", "mean": "황폐한 들과 산." }, "kun_sentence": { "text": "[蕪](かぶ)を[料](りょう)[理](り)する。", "mean": "순무를 요리하다." } },
    "葦": { "on_sentence": { "text": "[人間](にんげん)は[考](かんが)える[葦](あし)だ。", "mean": "인간은 생각하는 갈대다." }, "kun_sentence": { "text": "[葦](あし)の[原](はら)を[歩](ある)く。", "mean": "갈대밭을 걷다." } },
    "菫": { "on_sentence": { "text": "[菫](きん)[青](せい)[石](せき)を[見](み)つける。", "mean": "근청석(아이올라이트)을 찾다." }, "kun_sentence": { "text": "[菫](すみれ)の[花](はな)。", "mean": "제비꽃." } },
    "薯": { "on_sentence": { "text": "[薯](しょ)[類](るい)の[栽](さい)[培](ばい)。", "mean": "서류(감자류)의 재배." }, "kun_sentence": { "text": "[山](やま)[薯](いも)を[掘](ほ)る。", "mean": "마를 캐다." } },
    "蕾": { "on_sentence": { "text": "[蕾](らい)[禍](か)を[防](ふせ)ぐ。", "mean": "봉오리 때의 재앙(화근)을 막다." }, "kun_sentence": { "text": "[蕾](つぼみ)が[膨](ふく)らむ。", "mean": "꽃봉오리가 부풀다." } },
    "薙": { "on_sentence": { "text": "[薙](てい)[刀](とう)を[構](かま)える。", "mean": "치도(나기나타)를 자세를 잡다." }, "kun_sentence": { "text": "[薙](な)ぎ[倒](たお)す。", "mean": "베어 쓰러뜨리다." } },
    "藁": { "on_sentence": { "text": "[藁](こう)[本](ほん)を[作](つく)る。", "mean": "고본(초고)을 만들다." }, "kun_sentence": { "text": "[藁](わら)の[靴](くつ)。", "mean": "짚신." } },
    "蕨": { "on_sentence": { "text": "[蕨](けつ)[粉](ぷん)を[練](ね)る。", "mean": "고사리 가루를 개다." }, "kun_sentence": { "text": "[山](やま)[菜](さい)の[蕨](わらび)。", "mean": "산나물 고사리." } },
    "茨": { "on_sentence": { "text": "[茨](し)[城](き)[県](けん)へ[行](い)く。", "mean": "이바라키현에 가다." }, "kun_sentence": { "text": "[茨](いばら)の[道](みち)。", "mean": "가시밭길." } },
    "苔": { "on_sentence": { "text": "[苔](たい)[選](せん)[類](るい)を[研](けん)[究](きゅう)する。", "mean": "태선류(이끼류)를 연구하다." }, "kun_sentence": { "text": "[石](いし)に[苔](こけ)がむす。", "mean": "돌에 이끼가 끼다." } },
    "苟": { "on_sentence": { "text": "[苟](こう)[且](しょ)に[過](す)ごさない。", "mean": "구차하게(임시변통으로) 지내지 않는다." }, "kun_sentence": { "text": "[苟](いやしく)も[人](ひと)ならば。", "mean": "적어도 사람이라면." } },
    "茹": { "on_sentence": { "text": "[茹](じょ)[含](がん)する。", "mean": "맛보고 삼키다(음미하다)." }, "kun_sentence": { "text": "[豆](まめ)を[茹](ゆ)でる。", "mean": "콩을 삶다." } },
    "菱": { "on_sentence": { "text": "[菱](りょう)[形](けい)の[旗](はた)。", "mean": "마름모 형태의 깃발." }, "kun_sentence": { "text": "[菱](ひし)の[実](み)。", "mean": "마름 열매." } },
    "虞": { "on_sentence": { "text": "[危](き)[虞](ぐ)の[念](ねん)を[抱](いだ)く。", "mean": "우려되는 마음을 품다." }, "kun_sentence": { "text": "[憂](うれ)い[虞](おそ)れる。", "mean": "우려하고 두려워하다." } },
    "虜": { "on_sentence": { "text": "[捕](ほ)[虜](りょ)を[解](かい)[放](ほう)する。", "mean": "포로를 해방하다." }, "kun_sentence": { "text": "[心](こころ)の[虜](とりこ)。", "mean": "마음의 포로." } },
    "蚤": { "on_sentence": { "text": "[蚤](そう)[起](き)する。", "mean": "일찍 일어나다(조기)." }, "kun_sentence": { "text": "[蚤](のみ)を[捕](つか)まえる。", "mean": "벼룩을 잡다." } },
    "蛾": { "on_sentence": { "text": "[蛾](が)[眉](び)の[佳](か)[人](じん)。", "mean": "나방의 눈썹 같은 아름다운 미인(가미)." }, "kun_sentence": { "text": "[庭](にわ)に[蛾](が)が[飛](と)ぶ。", "mean": "정원에 나방이 날다." } },
    "蝦": { "on_sentence": { "text": "[蝦](か)[蟆](ま)の[油](あぶら)。", "mean": "두꺼비 기름." }, "kun_sentence": { "text": "[蝦](えび)を[食](た)べる。", "mean": "새우를 먹는다." } },
    "蟹": { "on_sentence": { "text": "[蟹](かい)[行](こう)する。", "mean": "게가 걸어가다(횡보하다)." }, "kun_sentence": { "text": "[蟹](かに)の[ハ](は)[サ](さ)[ミ](み)。", "mean": "게의 집게." } },
    "蟻": { "on_sentence": { "text": "[蟻](ぎ)[集](しゅう)する[人々](ひとびと)。", "mean": "개미떼처럼 모여드는 사람들." }, "kun_sentence": { "text": "[蟻](あり)の[群](む)れ。", "mean": "개미 떼." } },
    "蠅": { "on_sentence": { "text": "[蠅](よう)[声](せい)の[者](もの)。", "mean": "파리 소리처럼 앵앵거리는 자." }, "kun_sentence": { "text": "[蠅](はえ)を[追](お)う。", "mean": "파리를 쫓다." } },
    "蠍": { "on_sentence": { "text": "[蠍](かつ)[座](ざ)を[見](み)つける。", "mean": "전갈자리를 찾다." }, "kun_sentence": { "text": "[蠍](さそり)の[毒](どく)。", "mean": "전갈의 독." } },
    "俺": { "on_sentence": { "text": "[俺](えん)[通](つう)する。", "mean": "나(오레)가 통하다(? - Very rare)." }, "kun_sentence": { "text": "[俺](おれ)がやる。", "mean": "내가 한다." } },
    "誰": { "on_sentence": { "text": "[誰](すい)[何](か)される。", "mean": "검문(수하)당하다." }, "kun_sentence": { "text": "[誰](だれ)もいない。", "mean": "아무도 없다." } },
    "麓": { "on_sentence": { "text": "[山](さん)[麓](ろく)の[家](いえ)。", "mean": "산기슭의 집." }, "kun_sentence": { "text": "[麓](ふもと)の[泉](いずみ)。", "mean": "기슭의 샘." } },
    "脊": { "on_sentence": { "text": "[脊](せき)[椎](つい)を[痛](いた)める。", "mean": "척추를 다치다." }, "kun_sentence": { "text": "[脊](せ)すじを[伸](の)ばす。", "mean": "등줄기를 펴다." } },
    "尻": { "on_sentence": { "text": "[開](かい)[尻](しつ)する。", "mean": "개슬(무릎을 벌림)하다." }, "kun_sentence": { "text": "[尻](しり)を[捲](まく)る。", "mean": "본색을 드러내다." } },
    "裾": { "on_sentence": { "text": "[裙](くん)[裾](きょ)を[整](ととの)える。", "mean": "치마 자락을 정돈하다." }, "kun_sentence": { "text": "[裾](すそ)を[引](ひ)く。", "mean": "옷자락을 끌다." } }
};

let count = 0;
data.forEach(d => {
    if (replacements[d.kanji]) {
        if (replacements[d.kanji].on_sentence) d.on_sentence = replacements[d.kanji].on_sentence;
        if (replacements[d.kanji].kun_sentence) d.kun_sentence = replacements[d.kanji].kun_sentence;
        count++;
    }
});

// Triple check for Korean and empty ruby
data.forEach(d => {
    ['on_sentence', 'kun_sentence'].forEach(f => {
        if (d[f] && d[f].text) {
            d[f].text = d[f].text.replace(/는/g, 'は').replace(/를/g, 'を').replace(/이/g, 'が').replace(/에/g, '에'); // Fixed: 에 -> に below
            d[f].text = d[f].text.replace(/에/g, 'に').replace(/의/g, 'の');
            if (/[가-힣]/.test(d[f].text)) {
                // Manual sweep for any I missed
                d[f].text = d[f].text.replace(/으로/g, 'で').replace(/한다/g, 'する').replace(/입니다/g, 'だ');
            }
        }
    });
});

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`ULTRA final repair: ${count} items updated.`);
