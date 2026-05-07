import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();

const SRC_DATA_DIR = path.join(ROOT_DIR, "src", "data");
const CARD_QA_DEBUG_PATH = path.join(SRC_DATA_DIR, "cardQaDebug.json");
const CARD_QA_PATH = path.join(SRC_DATA_DIR, "cardQa.js");

const qaZhMap = {
  "36": {
    question: "【決鬥中】可以在什麼時機使用？",
    answer:
      "可以在遊戲手冊第 20 頁「攻擊對手角色或 Partner」項目中的「4：【決鬥中】使用時機①」及「7：【決鬥中】使用時機②」使用。"
  },
  "37": {
    question: "S01-001「哈利・波特」和 T01-001「哈利・波特」是否視為不同卡牌？",
    answer: "視為不同卡牌。"
  },
  "41": {
    question:
      "Pt003「哈利・波特」的「最多 1 張我方【葛來分多】卡變為活動狀態」可以令 Partner 卡變為活動狀態嗎？",
    answer:
      "不可以。若效果沒有指定對象所在區域（例如 MP 區、牌組等），只能指定決鬥場上的卡。"
  },
  "47": {
    question:
      "使用 Pt006「阿不思・鄧不利多」的「自己下一張打出的【教師】卡費用 -1」後，如果該回合沒有打出【教師】卡會怎樣？",
    answer: "該效果會在該回合內消失，不會延續到之後的回合。"
  },
  "48": {
    question:
      "使用 S01-001「哈利・波特」的「抽 2 張牌，將手牌 2 張置入棄牌區」時，如果牌組只剩 1 張牌，如何處理？",
    answer:
      "不會發生任何事。牌組只有 1 張時，無法執行「抽 2 張牌」。而且因為「抽 2 張牌」不能執行，所以「將手牌 2 張置入棄牌區」也不會發動。"
  },
  "49": {
    question:
      "S01-001「哈利・波特」的「抽 2 張牌，將手牌 2 張置入棄牌區」在沒有手牌時也會發動嗎？",
    answer: "會發動。"
  },
  "50": {
    question: "「Magic 卡被打出時」這類效果，對手打出的 Magic 卡也會觸發嗎？",
    answer: "會觸發。"
  },
  "51": {
    question:
      "使用「Break：將此卡放到支援區」的 Break 效果時，該卡之後會從支援區進入棄牌區嗎？",
    answer:
      "不會。因 Break 效果處理而從生命以外的區域移動的卡，不會進入棄牌區。"
  },
  "52": {
    question: "使用 S01-011「復復修」的 Break 效果時，是否視為打出了 Magic 卡？",
    answer: "是。會視為打出了 Magic 卡。"
  },
  "53": {
    question: "S01-012「魔杖」可以裝備給【魔法使】或【魔女】以外的角色嗎？",
    answer: "可以。不過不會獲得其效果。"
  },
  "54": {
    question:
      "主戰區已有 3 張角色時，如果再將道具卡裝備到主戰區角色上，需要將主戰區的卡置入棄牌區嗎？",
    answer:
      "不需要。重疊放在卡牌下方的卡，不計入主戰區或支援區的張數上限。"
  },
  "55": {
    question:
      "S01-013「分類儀式」的使用時機是【使用】【自己的主要階段】，如果在決鬥中從生命公開，是否可以透過「Break：可以免費使用此卡」來使用該卡效果？",
    answer:
      "可以。透過 Break 使用卡上記載的效果時，即使不是【自己的主要階段】也可以使用該卡效果。"
  },
  "56": {
    question:
      "主戰區已有 2 張我方角色時，可以打出 01-003「哈利・波特」，並將 01-003 置入棄牌區，把支援區中費用 4 以下的我方角色移到主戰區嗎？",
    answer: "可以。"
  },
  "57": {
    question:
      "因 01-003「哈利・波特」的「將支援區中費用 4 以下的最多 1 張我方角色移到主戰區」而移到主戰區的角色，可以攻擊嗎？",
    answer: "如果該角色不是該回合打出的角色，就可以立即攻擊。"
  },
  "58": {
    question:
      "01-008「阿不思・鄧不利多」的「【常時】【每回合 1 次】自己打出 Magic 卡時，抽 1 張牌。」如果在自己的回合已發動 1 次，下一個對手回合還可以再發動 1 次嗎？",
    answer:
      "可以。【常時】【每回合 1 次】是在雙方玩家各自的回合中，每個回合最多發動 1 次。"
  },
  "59": {
    question:
      "01-012「哈利・波特」的「將主戰區中 1 張我方【麻瓜】卡變為休息狀態，並使此卡變為活動狀態。」可以將本回合剛進入主戰區的我方【麻瓜】卡變為休息狀態嗎？",
    answer: "可以。"
  },
  "60": {
    question:
      "01-020「跩哥・馬份」的「使與此卡決鬥中的對手角色 -2/-2」是讓對手角色和此卡自身兩張卡都 -2/-2 嗎？",
    answer: "不是。這個效果只會使此卡的決鬥對手，即對手角色 -2/-2。"
  },
  "61": {
    question:
      "自己的回合中，對手的 01-022「葛瑞・高爾」倒下，因其「最多 1 張對手角色直到回合結束為止 -2/-2」使 S01-002「哈利・波特」受到 -2/-2，DP 變成 0 而成為休息狀態。該回合結束時，如果用「【自動】【自己的回合結束時】最多 1 張我方角色變為活動狀態」讓該 S01-002 變為活動狀態，會怎樣？",
    answer:
      "首先由當前回合玩家（自己）處理回合結束時效果。S01-002「哈利・波特」會先變為活動狀態，但因 DP 為 0，會再次變為休息狀態。之後才由非當前回合玩家（對手）處理 01-022「葛瑞・高爾」的 -2/-2 持續效果結束。"
  },
  "62": {
    question:
      "休息狀態的 01-024「米奈娃・麥」被攻擊時，反擊會發動嗎？",
    answer: "不會發動。"
  },
  "63": {
    question:
      "01-027「奎里納斯・奎若」的「使對手 MP 區 1 張卡變為休息狀態」可以指定 MP 卡嗎？",
    answer: "不可以。MP 卡不視為在 MP 區中的卡。"
  },
  "64": {
    question:
      "當「喬治・衛斯理」在主戰區時，主戰區中的 01-041「弗雷・衛斯理」費用是多少？",
    answer:
      "是 4。因為「【常時】此卡在手牌中，且自己的主戰區有『弗雷・衛斯理』卡時，此卡費用 -2」在手牌以外不會發動。"
  },
  "65": {
    question:
      "01-047「阿不思・鄧不利多」的「所有我方【教師】卡 +1/+1」會包含 01-047「阿不思・鄧不利多」自身嗎？",
    answer: "會包含自身。"
  },
  "66": {
    question:
      "01-048「米奈娃・麥」的「最多 1 張手牌放到 MP 區」所放置的卡，會以活動狀態放置嗎？",
    answer: "會以活動狀態放置。沒有指定為休息狀態放置的卡，全部都以活動狀態放置。"
  },
  "67": {
    question:
      "01-049「賽佛勒斯・石內卜」的「對手將 1 張休息狀態的自己角色移回手牌」是由哪位玩家選擇哪張角色回手？",
    answer:
      "由對手玩家選擇對手自己決鬥場上 1 張休息狀態的角色，並移回手牌。此時，對手也可以選擇支援區中的角色。"
  },
  "68": {
    question:
      "打出 01-049「賽佛勒斯・石內卜」時，如果對手決鬥場上沒有休息狀態的角色，會怎樣？",
    answer: "不會發生任何事。"
  },
  "69": {
    question:
      "打出 01-049「賽佛勒斯・石內卜」後，若對手將裝備了 S01-012「魔杖」的角色移回手牌，S01-012「魔杖」會怎樣？",
    answer: "會移到棄牌區。"
  },
  "70": {
    question:
      "01-050「蘿蘭達・胡奇」發動「【P 連結『阿不思・鄧不利多』】【宣言】【決鬥中】橫置：最多 1 張我方【教師】卡直到回合結束為止 +1/+1」後，如果該回合中 01-050「蘿蘭達・胡奇」再次變為活動狀態，可以再次發動該【宣言】【決鬥中】橫置效果嗎？",
    answer: "可以。"
  },
  "71": {
    question:
      "01-053「魯霸・海格」在對手角色全部為活動狀態時，可以攻擊對手角色嗎？",
    answer: "不可以。"
  },
  "72": {
    question:
      "01-053「魯霸・海格」與另一張可以攻擊 Partner 的卡一起進行 2 張卡攻擊時，可以攻擊 Partner 嗎？",
    answer:
      "不可以。以 2 張卡攻擊時，必須在宣告攻擊時，將能夠攻擊同一對象的 2 張角色變為休息狀態。"
  },
  "73": {
    question:
      "01-054「阿各・飛七」受到對手角色攻擊，並由其他我方角色阻擋該攻擊。該決鬥中，自己可以打出 Magic 卡嗎？",
    answer: "可以。"
  },
  "74": {
    question:
      "01-061「哈利・波特」的「【自動】【登場】將主戰區中 1 張我方【麻瓜】卡移回手牌，並使此卡變為活動狀態。」在主戰區有我方【麻瓜】卡時，是否一定要移回手牌？",
    answer:
      "如果主戰區有我方【麻瓜】卡，必須移回手牌。另外，如果主戰區沒有我方【麻瓜】卡，則「使此卡變為活動狀態」不會發動。"
  },
  "75": {
    question:
      "主戰區沒有我方【麻瓜】卡時，01-061「哈利・波特」的「使此卡變為活動狀態」會發動嗎？",
    answer: "不會發動。"
  },
  "76": {
    question:
      "如果將 01-061「哈利・波特」打出到支援區，【常時】或【自動】【登場】會發動嗎？",
    answer: "不會發動。"
  },
  "77": {
    question:
      "打出 01-064「威農・德思禮」時，如果不能從手牌將 1 張【信】卡置入棄牌區，「之後，對手將 1 張手牌置入棄牌區」會發動嗎？",
    answer: "不會發動。"
  },
  "78": {
    question:
      "01-033「入學許可書」的「查看牌組上方 2 張牌，從中最多公開 1 張【魔法使】或【魔女】卡並加入手牌」如果沒有將卡加入手牌，「之後，將剩餘卡以任意順序放到牌組下方」會發動嗎？",
    answer: "會發動。"
  },
  "79": {
    question:
      "01-065「佩妮・德思禮」翻開的卡會保持正面嗎，還是要翻回背面？",
    answer:
      "會保持正面繼續遊戲。不過，牌組中正面朝上的卡仍會包含在洗牌效果、查看牌組效果、從牌組公開的效果對象中；當其回到牌組上方或下方等位置時，要翻回背面放回牌組。"
  },
  "80": {
    question:
      "即使對手主戰區有「哈利・波特」卡，01-068「達力・德思禮」也會倒下嗎？",
    answer: "是，會倒下。"
  },
  "81": {
    question:
      "01-073「毛毛」因 01-076「阿咯哈呣啦」的效果從牌組加入手牌時，如何處理？",
    answer:
      "首先，因 01-076「阿咯哈呣啦」的效果抽 2 張牌。在將這 2 張與其他手牌混合前，可以將其中任意數量的 01-073「毛毛」展示給對手，並放到主戰區。之後，再處理 01-076「阿咯哈呣啦」的「將 1 張手牌置入棄牌區」。"
  },
  "82": {
    question:
      "以 2 張我方角色進行攻擊的決鬥中，如果自己打出 01-074「溫咖癲啦唯啊薩」，決鬥中的 2 張我方角色都會 ±0/-5 嗎？",
    answer: "是，決鬥中的 2 張我方角色都會受到 ±0/-5。"
  },
  "83": {
    question:
      "打出 01-074「溫咖癲啦唯啊薩」後才宣告阻擋的角色，會受到 ±0/-5 嗎？",
    answer: "不會，不會受到 ±0/-5。"
  },
  "84": {
    question:
      "可以確認 01-077「記憶球」背面重疊放置的卡牌內容嗎？",
    answer: "不可以。"
  },
  "85": {
    question:
      "01-078「校長的卡」放到主戰區的「阿不思・鄧不利多」，如果在下一個自己的回合開始時位於支援區，會回到手牌嗎？",
    answer:
      "只要仍在決鬥場上，就會回到手牌。不過，如果放出的卡曾經離開過決鬥場，則回手牌的效果不會發動。"
  },
  "86": {
    question:
      "01-079「移動樓梯」可以將對手的攻擊對象改為 1 張活動狀態的我方角色嗎？",
    answer: "不可以。"
  },
  "87": {
    question:
      "01-080「九又四分之三月台」的「【自動】【自己的回合結束時】將 1 張手牌置入棄牌區，最多 1 張我方【霍格華茲】卡移到主戰區」是從哪裡移到主戰區？",
    answer: "是從支援區將最多 1 張我方【霍格華茲】卡移到主戰區。"
  },
  "88": {
    question:
      "01-080「九又四分之三月台」在回合結束時，可以選擇不棄手牌，也不將卡移到主戰區嗎？",
    answer:
      "不可以選擇不做。【自動】【自己的回合結束時】必須發動。即使支援區沒有 1 張我方【霍格華茲】卡，也必須將 1 張手牌置入棄牌區。"
  },
  "89": {
    question:
      "因 01-080「九又四分之三月台」的效果，S01-002「哈利・波特」從支援區移到主戰區時，該回合的「【自動】【自己的回合結束時】最多 1 張我方角色變為活動狀態」會發動嗎？",
    answer:
      "不會發動。當處理回合結束時會發生的效果時，如果該卡當時處於不能發動效果的狀態，即使之後變成可以發動效果的狀態，也不能再發動該效果。"
  },
  "90": {
    question:
      "自己沒有手牌時，可以發動 01-080「九又四分之三月台」的「最多 1 張我方【霍格華茲】卡移到主戰區」嗎？",
    answer: "不可以。"
  },
  "91": {
    question:
      "01-081「奧利凡德魔杖店」在沒有可以裝備「魔杖」的我方角色時，仍可以取出「魔杖」嗎？",
    answer:
      "不可以。若沒有可以裝備「魔杖」的我方角色，該「魔杖」會留在牌組上方 10 張之中。"
  }
};

function makeJsString(value) {
  return JSON.stringify(value, null, 2);
}

function buildCardQaJs(cardQaObject) {
  return `// This file is auto-generated by scripts/translateCardQaToChinese.js
// Do not edit manually.
// Generated at: ${new Date().toISOString()}

export const cardQa = ${makeJsString(cardQaObject)};

export function getBaseCardQaId(id = "") {
  return String(id || "").trim().replace(/[a-z]$/i, "");
}

export function getCardQa(card = {}) {
  if (!card) return [];

  const candidates = [
    card.cardNo,
    card.cardNumber,
    card.id,
    card.number,
    card.cardId
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());

  for (const candidate of candidates) {
    if (cardQa[candidate]) {
      return cardQa[candidate];
    }

    const baseCandidate = getBaseCardQaId(candidate);

    if (cardQa[baseCandidate]) {
      return cardQa[baseCandidate];
    }
  }

  return [];
}

export default cardQa;
`;
}

function main() {
  if (!fs.existsSync(CARD_QA_DEBUG_PATH)) {
    console.error("找不到 cardQaDebug.json，請先執行 npm run download:qa");
    process.exit(1);
  }

  const debugData = JSON.parse(fs.readFileSync(CARD_QA_DEBUG_PATH, "utf8"));
  const originalCardQa = debugData.cardQa || {};

  const translatedCardQa = {};

  let translatedCount = 0;
  let fallbackCount = 0;

  for (const [cardNumber, qas] of Object.entries(originalCardQa)) {
    translatedCardQa[cardNumber] = qas.map((qa) => {
      const id = String(qa.id || "");
      const zh = qaZhMap[id];

      if (zh) {
        translatedCount++;

        return {
          id: qa.id,
          question: zh.question,
          answer: zh.answer,
          updatedAt: qa.updatedAt || "",
          originalQuestion: qa.question || "",
          originalAnswer: qa.answer || "",
          raw: qa.raw || qa
        };
      }

      fallbackCount++;

      return {
        ...qa,
        originalQuestion: qa.question || "",
        originalAnswer: qa.answer || "",
        raw: qa.raw || qa
      };
    });
  }

  fs.writeFileSync(CARD_QA_PATH, buildCardQaJs(translatedCardQa), "utf8");

  console.log("Chinese cardQa.js generated.");
  console.log(`Translated Q&A records: ${translatedCount}`);
  console.log(`Fallback Japanese records: ${fallbackCount}`);
  console.log(`Saved: ${CARD_QA_PATH}`);
}

main();