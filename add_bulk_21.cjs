const fs = require('fs');
const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let maxId = Math.max(...data.map(k => k.id), 0);
let existingKanjiMap = new Map();
data.forEach((k, idx) => { existingKanjiMap.set(k.kanji, idx); });

const rawData = [
    "待|기다릴 대|タイ|ま.つ|N4|이동·행동|길(彳)에서 관청(寺)의 명령을 받으려고 서서 '기다리다'는 뜻입니다.|[招待](しょうたい),しょうたい,초대 (음독);[待つ](まつ),まつ,기다리다 (훈독)|[友達](ともだち)を[招待](しょうたい)する。,친구를 초대하다.|[駅](えき)で[人](ひと)を[待](ま)つ。,역에서 사람을 기다리다.",
    "得|얻을 득|トク|え.る/う.る|N3|행동·상태|길(彳)을 가다가 마침내 조개(貝=재물)를 찾아 손(寸)에 넣고 '얻다'입니다.|[得意](とくい),とくい,자랑스러움/특기 (음독);[得る](える),える,얻다 (훈독)|[得意](とくい)な[料理](りょうり)だ。,자신 있는 요리이다.|[経験](けいけん)を[得](え)る。,경험을 얻다.",
    "役|부릴 역|ヤク/エキ|-|N3|인간·사회|길(彳)을 닦고 창(殳)을 든 병사들을 이끌어 일을 '도맡다/부리다'입니다.|[役割](やくわり),やくわり,역할 (음독);[主役](しゅやく),しゅやく,주역/주인공 (음독)|[重要](じゅうよう)な[役割](やくわり)だ。,중요한 역할이다.|[劇](げき)の[主役](しゅやく)を[演](えん)じる。,연극의 주인공을 연기하다.",
    "往|갈 왕|オウ|-|N3|이동·방향|사람(주인 主)이 길(彳)을 따라 멀리 앞으로 '가다'는 뜻입니다.|[往復](おうふく),おうふく,왕복 (음독);[往診](おうしん),おうしん,왕진 (음독)|[往復](おうふく)[切符](きっぷ)を[買](か)う。,왕복 표를 사다.|-,-",
    "復|돌아올 복|フク|-|N3|이동·상태|발걸음(彳)을 뒤집어(复) 다시 원래 있던 곳으로 '돌아오다/반복하다'입니다.|[往復](おうふく),おうふく,왕복 (음독);[復習](ふくしゅう),ふくしゅう,복습 (음독)|[往復](おうふく)で[歩](ある)く。,왕복으로 걷다.|[授業](じゅぎょう)の[復習](ふくしゅう)だ。,수업의 복습이다.",
    "径|지름길 경|ケイ|-|N3|사물·지형|수레끌개(巠)가 좁고 가파른 길(彳)을 오르는 '오솔길/지름길'입니다.|[直径](ちょっけい),ちょっけい,직경/지름 (음독);[半径](はんけい),はんけい,반경/반지름 (음독)|[円](えん)の[直径](ちょっけい)だ。,원의 직경이다.|-,-",
    "律|법칙 률|リツ/リチ|-|N3|사회·규범|붓(聿)을 들고 길(彳)에 새겨 사람들이 지키게 하는 '법칙/규칙'입니다.|[法律](ほうりつ),ほうりつ,법률 (음독);[規律](きりつ),きりつ,규율 (음독)|[法律](ほうりつ)を[守](まも)る。,법률을 지키다.|-,-",
    "微|작을 미|ビ|-|N3|상태·크기|산(山) 옆 작은 길(彳) 뒤로 맞고 쓰여서 닳아 '작다/가늘다'입니다.|[微笑](びしょう),びしょう,미소 (음독);[微風](びふう),びふう,미풍/산들바람 (음독)|[微笑](びしょう)を浮(う)かべる。,미소를 짓다.|-,-",
    "徴|부를 징|チョウ|-|N3|행동·상태|왕(王)이 길(彳)에서 여러 사람에게 세금을 바치도록 징수하고 '부르다'입니다.|[特徴](とくちょう),とくちょう,특징 (음독);[象徴](しょうちょう),しょうちょう,상징 (음독)|[顔](かお)の[特徴](とくちょう)だ。,얼굴의 특징이다.|-,-",
    "徳|큰 덕|トク|-|N3|인간·성품|눈(目)을 모으고 마음(心)을 올곧게 내밀며 길(彳)을 열어주는 어진 '덕'입니다.|[道徳](どうとく),どうとく,도덕 (음독);[人徳](じんとく),じんとく,인덕 (음독)|[道徳](どうとく)[的](てき)な[人](ひと)だ。,도덕적인 사람이다.|-,-",
    "忘|잊을 망|ボウ|わす.れる|N4|생각·감정|마음(心)이 죽어(亡) 무언가가 기억 안 나고 캄캄해져 '잊다'는 뜻입니다.|[忘年会](ぼうねんかい),ぼうねんかい,망년회 (음독);[忘れる](わすれる),わすれる,잊다 (훈독)|[忘年会](ぼうねんかい)に[参加](さんか)する。,망년회에 참가하다.|[約束](やくそく)を[忘](わす)れる。,약속을 잊다.",
    "忙|바쁠 망|ボウ|いそが.しい|N4|행동·상태|마음(心)이 다급하고 죽을(亡) 지경으로 쫓겨 '바쁘다'입니다.|[多忙](たぼう),たぼう,다망/매우 바쁨 (음독);[忙しい](いそがしい),いそがしい,바쁘다 (훈독)|[多忙](たぼう)な[毎日](まいにち)だ。,매우 바쁜 매일이다.|[仕事](しごと)で[忙](いそが)しい。,일로 바쁘다.",
    "怒|성낼 노|ド|いか.る/おこ.る|N3|생각·감정|여종(奴)이 꾸중 듣고 억울해 마음(心)이 부글부글 끓어 '성내다'입니다.|[激怒](げきど),げきど,격노 (음독);[怒る](おこる),おこる,화내다 (훈독);[怒り](いかり),いかり,분노 (훈독)|[社長](しゃちょう)が[激怒](げきど)する。,사장이 격노하다.|[先生](せんせい)が[怒](おこ)る。,선생님이 화내다.;[怒](いか)りを[感](かん)じる。,분노를 느끼다.",
    "恐|두려울 공|キョウ|おそ.れる/おそ.ろしい|N3|생각·감정|장인(工)이 무언가(凡)를 쳤으나 무너져 마음(心)이 조마조마 '두렵다'입니다.|[恐怖](きょうふ),きょうふ,공포 (음독);[恐れる](おそれる),おそれる,두려워하다 (훈독);[恐ろしい](おそろしい),おそろしい,무섭다 (훈독)|[恐怖](きょうふ)を[感](かん)じる。,공포를 느끼다.|[失敗](しっぱい)を[恐](おそ)れる。,실패를 두려워하다.;[恐](おそ)ろしい[夢](ゆめ)だ。,무서운 꿈이다.",
    "悲|슬플 비|ヒ|かな.しい/かな.しむ|N3|생각·감정|마음(心)이 나뉠(非) 정도로 찢어지게 아프고 '슬프다'는 의미입니다.|[悲観](ひかん),ひかん,비관 (음독);[悲しい](かなしい),かなしい,슬프다 (훈독);[悲しむ](かなしむ),かなしむ,슬퍼하다 (훈독)|[将来](しょうらい)を[悲観](ひかん)する。,장래를 비관하다.|[悲](かな)しい[話](はなし)だ。,슬픈 이야기이다.;[友](とも)の[死](し)を[悲](かな)しむ。,친구의 죽음을 슬퍼하다."
];

let addedCount = 0;
let updateCount = 0;

rawData.forEach(row => {
    let [kanji, meaning, on, kun, cat, sub, exp, wordsRaw, onSentRaw, kunSentRaw] = row.split('|');

    let ex = [];
    if (wordsRaw && wordsRaw !== "-,-") wordsRaw.split(';').forEach(wPart => { let [word, reading, mean] = wPart.split(','); if (word) ex.push({ word, reading, mean }); });
    let os = [];
    if (onSentRaw && onSentRaw !== "-,-") onSentRaw.split(';').forEach(sPart => { let [text, mean] = sPart.split(','); if (text) os.push({ text, mean }); });
    let ks = [];
    if (kunSentRaw && kunSentRaw !== "-,-") kunSentRaw.split(';').forEach(sPart => { let [text, mean] = sPart.split(','); if (text) ks.push({ text, mean }); });

    if (existingKanjiMap.has(kanji)) {
        let idx = existingKanjiMap.get(kanji);
        let existing = data[idx];

        let needsUpdate = false;
        if (existing.examples) {
            let hasRuby = existing.examples.every(e => e && e.word && e.word.includes('['));
            if (!hasRuby || existing.examples.length < ex.length) needsUpdate = true;
            let isSingle = existing.examples.some(e => e && e.word && e.word.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').length === 1);
            if (isSingle) needsUpdate = true;
        } else {
            needsUpdate = true;
        }

        if (existing.on_sentence && existing.on_sentence.some(s => s && s.text && (s.text.includes('と[読](よ)む') || s.text.length < 5))) needsUpdate = true;
        if (existing.kun_sentence && existing.kun_sentence.some(s => s && s.text && (s.text.includes('と[読](よ)む') || s.text.length < 5))) needsUpdate = true;

        if (needsUpdate || !existing.on_sentence || existing.on_sentence.length === 0) {
            existing.on_reading = on;
            existing.kun_reading = kun;
            existing.category = cat;
            existing.subcategory = sub;
            existing.explanation = exp;
            existing.examples = ex;
            existing.on_sentence = os;
            existing.kun_sentence = ks;
            updateCount++;
        }
    } else {
        maxId++;
        data.push({ id: maxId, kanji, meaning, on_reading: on, kun_reading: kun, category: cat, subcategory: sub, explanation: exp, examples: ex, on_sentence: os, kun_sentence: ks });
        existingKanjiMap.set(kanji, data.length - 1);
        addedCount++;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updateCount}, Added ${addedCount} for Batch 21!`);
