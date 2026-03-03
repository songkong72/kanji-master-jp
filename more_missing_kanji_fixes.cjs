const fs = require('fs');
const kanjiDataPath = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(kanjiDataPath, 'utf8'));

const notUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)에서는 [使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const notUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)에서는 [使](つ가)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };
// REDO: AGAIN I TYPED KOREAN '에서는' in text. FIXED:
const cleanNotUsedOn = { "text": "この[漢字](かんじ)は[通常](つうじょう)[音読](おんどく)では[使](つか)われません。", "mean": "이 한자는 통상 음독으로는 사용되지 않습니다." };
const cleanNotUsedKun = { "text": "この[漢字](かんじ)は[通常](つうじょう)[訓読](くんどく)では[使](つか)われません。", "mean": "이 한자는 통상 훈독으로는 사용되지 않습니다." };


const fixes = {
    "誰": { "kun_sentence": { "text": "[誰](だれ)もいない[部屋](へや)で[作業](さぎょう)する。", "mean": "아무도 없는 방에서 작업한다." } },
    "麓": { "kun_sentence": { "text": "[富士山](ふじさん)の[麓](ふもと)からの[眺](なが)め。", "mean": "후지산 기슭에서의 전망." } },
    "畿": { "kun_sentence": { "text": "[近畿](きんき)の[中心](ちゅうしん)は[京](みやこ)だ。", "mean": "긴키의 중심은 도읍(미야코)이다." } },
    "毅": { "kun_sentence": { "text": "[毅](つよ)い[心](こころ)で[困難](こんなん)を[乗](の)り[越](こ)える。", "mean": "강인한 마음으로 곤란을 이겨내다." } },
    "脊": { "kun_sentence": { "text": "[脊](せ)すじを[伸](の)ばして[歩](ある)く。", "mean": "등줄기를 펴고 걷다." } },
    "緒": { "kun_sentence": { "text": "[感情](かんじょう)の[緒](お)を[解](と)く。", "mean": "감정의 실마리를 풀다." } },
    "唄": { "kun_sentence": { "text": "[浮世](うきよ)を[歌](うた)う[小唄](こうた)。", "mean": "속세를 노래하는 코우타(짧은 노래)." } },
    "棄": { "kun_sentence": { "text": "[不要](ふよう)なものを[抛](ほう)[棄](き)する。", "mean": "불필요한 것을 포기(폐기)한다." } }, // Using target in a compound if kun is hard, but d.kun_reading is す.てる
    "棄": { "kun_sentence": { "text": "[ゴミ](ごみ)を[棄](す)ててはいけない。", "mean": "쓰레기를 버려서는 안 된다." } },
    "糾": { "kun_sentence": { "text": "[不正](ふせい)を[糾](ただ)す[正義](せいぎ)の[味方](みかた)。", "mean": "부정을 바로잡는 정의의 편." } },
    "葦": { "kun_sentence": { "text": "[風](かぜ)に[揺](ゆ)れる[葦](あし)の[原](はら)。", "mean": "바람에 흔들리는 갈대밭." } },
    "薯": { "kun_sentence": { "text": "[焼](や)[薯](いも)を[買](か)って[食](た)べる。", "mean": "군고구마를 사서 먹는다." } },
    "脊": { "kun_sentence": { "text": "[背](せ)[脊](せなか)を[丸](まる)めてはいけない。", "mean": "등을 둥글게 말아서는(구부정하게 해서는) 안 된다." } },
    "脊": { "kun_sentence": { "text": "[脊](せ)を[伸](の)ばす。", "mean": "등을 펴다." } },
    "毅": { "on_sentence": { "text": "[毅然](きぜん)とした[態度](たいど)。", "mean": "의연한 태도." }, "kun_sentence": { "text": "[毅](つよ)い[信念](しんねん)を[持](も)つ。", "mean": "강인한 신념을 가지다." } },
    "袴": { "kun_sentence": { "text": "[正月](しょうがつ)に[袴](はかま)を[着](き)る。", "mean": "정월에 하카마(일본 전통 남성복)를 입다." } },
    "襟": { "kun_sentence": { "text": "[襟](えり)を[正](ただ)して[話](はなし)を[聞](き)く。", "mean": "옷깃을 바로잡고(자세를 가다듬고) 이야기를 듣다." } },
    "背": { "kun_sentence": { "text": "[背](せなか)を[痛](いた)めてしまった。", "mean": "등을 다쳐 버렸다." } },
    "蠅": { "kun_sentence": { "text": "[五月蠅](うるさ)い[蠅](はえ)を[追](お)い[払](はら)う。", "mean": "시끄러운(귀찮은) 파리를 쫓아내다." } },
    "蠍": { "kun_sentence": { "text": "[砂漠](さばく)で[蠍](さそり)に[注意](ちゅうい)する。", "mean": "사막에서 전갈을 주의하다." } },
    "麓": { "kun_sentence": { "text": "[山](やま)の[麓](ふもと)の[村](むら)。", "mean": "사나래(산기슭) 마을." } },
    "畿": { "kun_sentence": { "text": "[畿](みやこ)の[外](そと)へ[出](で)る。", "mean": "도성 밖으로 나가다." } },
    "脊": { "kun_sentence": { "text": "[脊](せ)すじが[凍](こお)るような[体験](たいけん)。", "mean": "등줄기가 얼어붙는 듯한 체험." } },
    "糾": { "kun_sentence": { "text": "[不正](ふせい)を[糾](ただ)すために[立](た)ち[上](あ)がる。", "mean": "부정을 바로잡기 위해 일어서다." } },
    "棄": { "kun_sentence": { "text": "[権利](けんり)を[棄](す)てることはできない。", "mean": "권리를 포기할(버릴) 수는 없다." } }
};

let count = 0;
data.forEach(d => {
    if (fixes[d.kanji]) {
        if (fixes[d.kanji].on_sentence) d.on_sentence = fixes[d.kanji].on_sentence;
        if (fixes[d.kanji].kun_sentence) d.kun_sentence = fixes[d.kanji].kun_sentence;
        count++;
    }
});

fs.writeFileSync(kanjiDataPath, JSON.stringify(data, null, 2));
console.log(`Fix batch applied to ${count} kanjis.`);
