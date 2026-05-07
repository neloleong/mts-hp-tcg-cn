import { parseRawCards } from "../cardFactory";

const rawCards = `
PR-001|PR-001|哈利・波特|ハリー・ポッター|角色卡|葛來分多|PR||||魔法使／霍格華茲／葛來分多|promo-pr|PR 宣傳卡資料暫未補充。
`;

export const promoPRCards = parseRawCards(rawCards, {
  defaultSeries: "promo-pr",
  defaultProduct: "promo-pr",
  defaultRarity: "PR"
});