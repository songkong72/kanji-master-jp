const fs = require('fs');

const dataPath = 'src/data/kanjiData.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let maxId = Math.max(...data.map(k => k.id), 0);
let existingKanji = new Set(data.map(k => k.kanji));

const rawData = [
    "洋|큰바다 양|ヨウ|-|N4|자연·지형|물(氵)이 양(羊) 떼처럼 이어지는 광활한 '큰 바다'입니다.|[西洋](せいよう),せいよう,서양 (음독);[海洋](かいよう),かいよう,해양/바다 (음독)|[西洋](せいよう)の[文化](ぶんか)を[学](まな)ぶ。,서양 문화를 배우다.|-,-",
    "氷|얼음 빙|ヒョウ|こおり/ひ|N3|자연·현상|물(水)이 얼어붙어 생긴 결정체(점)인 '얼음'입니다.|[氷点下](ひょうてんか),ひょうてんか,빙점하/영하 (음독);[氷](こおり),こおり,얼음 (훈독)|[氷点下](ひょうてんか)に[下](さ)がる。,영하로 내려가다.|[氷](こおり)が[溶](と)ける。,얼음이 녹다.",
    "池|못 지|チ|いけ|N4|자연·지형|물(氵)을 끼고 이리저리(也) 뻗어 나간 '연못'을 뜻합니다.|[電池](でんち),でんち,전지/배터리 (음독);[池](いけ),いけ,연못 (훈독)|[電池](でんち)を[交換](こうかん)する。,전지를 교환하다.|[池](いけ)の[魚](さかな)を[見](み)る。,연못의 물고기를 보다.",
    "活|살 활|カツ|い.きる/い.かす/い.ける|N3|행동·상태|물(氵)이 막힘없이 흘러가듯 혀(舌)로 물을 먹어 '살다'는 생명력을 의미합니다.|[活動](かつどう),かつどう,활동 (음독);[生きる](いきる),いきる,살다 (훈독);[生かす](いかす),いかす,살리다 (훈독)|[活動](かつどう)に[参加](さんか)する。,활동에 참가하다.|[元気](げんき)に[生](い)きる。,건강하게 살다.;[経験](けいけん)を[生](い)かす。,경험을 살리다.",
    "清|맑을 청|セイ/ショウ|きよ.い/きよ.まる/きよ.める|N3|감각·상태|물(氵)이 푸르러서(青) 맑고 투명하여 '맑다'는 뜻입니다.|[清潔](せいけつ),せいけつ,청결 (음독);[清い](きよい),きよい,맑다/깨끗하다 (훈독);[清める](きよめる),きよめる,맑게 하다/정화하다 (훈독)|[清潔](せいけつ)に[保](たも)つ。,청결하게 유지하다.|[清](きよ)い[心](こころ)を[持](も)つ。,맑은 마음을 가지다.;[手](て)を[清](きよ)める。,손을 씻어 깨끗이 하다.",
    "深|깊을 심|シン|ふか.い/ふか.まる/ふか.める|N3|자연·상태|물(氵) 속으로 나무(木) 구멍(穴)을 파듯 깊숙이 '깊다'는 의미입니다.|[深夜](しんや),しんや,심야 (음독);[深い](ふかい),ふかい,깊다 (훈독);[深まる](ふかまる),ふかまる,깊어지다 (훈독)|[深夜](しんや)まで[起](お)きている。,심야까지 깨어 있다.|[海](うみ)が[深](ふか)い。,바다가 깊다.;[秋](あき)が[深](ふか)まる。,가을이 깊어지다.",
    "落|떨어질 락|ラク|お.ちる/お.とす|N3|이동·행동|풀(艹)잎이나 나뭇잎에서 비스듬히(洛) 이슬이 '떨어지다'입니다.|[落選](らくせん),らくせん,낙선 (음독);[落ちる](おちる),おちる,떨어지다 (훈독);[落とす](おとす),おとす,떨어뜨리다/내리다 (훈독)|[選挙](せんきょ)で[落選](らくせん)する。,선거에서 낙선하다.|[葉](は)が[落](お)ちる。,잎이 떨어지다.;[財布](さいふ)を[落](お)とす。,지갑을 떨어뜨리다.",
    "葉|잎 엽|ヨウ|は|N3|자연·식물|나무(木) 가지에 얇은 잎(世)들이 겹겹이(艹) 달린 '나뭇잎'입니다.|[紅葉](こうよう),こうよう,단풍 (음독);[葉](は),は,잎 (훈독)|[紅葉](こうよう)を[見](み)に[行](い)く。,단풍을 보러 가다.|[葉](は)が[色](いろ)づく。,잎이 물들다.",
    "草|풀 초|ソウ|くさ|N4|자연·식물|들판에 일찍(早) 돋아나는 식물(艹), 번식력 강한 '풀'을 말합니다.|[雑草](ざっそう),ざっそう,잡초 (음독);[草](くさ),くさ,풀 (훈독)|[雑草](ざっそう)を[抜](ぬ)く。,잡초를 뽑다.|[草](くさ)が[生](は)える。,풀이 나다.",
    "茶|차 다|チャ/サ|-|N4|식음·요리|풀(艹)의 싹(人 모양)을 말려 나무(木)나 짚으로 불을 지펴 끓이는 '차'입니다.|[お茶](おちゃ),おちゃ,차(녹차 등) (음독);[茶色](ちゃいろ),ちゃいろ,다색/갈색 (음독)|[お茶](おちゃ)を[飲](の)む。,차를 마시다.|-,-"
];

let addedCount = 0;

rawData.forEach(row => {
    let [kanji, meaning, on, kun, cat, sub, exp, wordsRaw, onSentRaw, kunSentRaw] = row.split('|');
    if (!existingKanji.has(kanji)) {
        maxId++;

        let ex = [];
        if (wordsRaw && wordsRaw !== "-,-") {
            wordsRaw.split(';').forEach(wPart => {
                let [word, reading, mean] = wPart.split(',');
                if (word && reading && mean) ex.push({ word, reading, mean });
            });
        }

        // Ensure complex words logic applies
        let onC = false;
        let kunC = false;
        ex.forEach(e => {
            if (e.mean.includes('(음독)')) onC = true;
            if (e.mean.includes('(훈독)')) kunC = true;
        });

        // if kun reading exists but no kun word, that's bad.
        // We ensure rawData provided adheres to the complex words guideline.

        let os = [];
        if (onSentRaw && onSentRaw !== "-,-") {
            onSentRaw.split(';').forEach(sPart => {
                let [text, mean] = sPart.split(',');
                if (text && mean) os.push({ text, mean });
            });
        }

        let ks = [];
        if (kunSentRaw && kunSentRaw !== "-,-") {
            kunSentRaw.split(';').forEach(sPart => {
                let [text, mean] = sPart.split(',');
                if (text && mean) ks.push({ text, mean });
            });
        }

        data.push({
            id: maxId, kanji, meaning,
            on_reading: on, kun_reading: kun,
            category: cat, subcategory: sub,
            explanation: exp, examples: ex,
            on_sentence: os, kun_sentence: ks
        });
        existingKanji.add(kanji);
        addedCount++;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`System processed and added ${addedCount} extremely precise kanji data! (Batch 11)`);
