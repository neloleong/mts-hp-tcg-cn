import { cardTypes, houses, rarities, seriesOptions } from "./cardOptions";
import { booster01Cards } from "./cardSeries/booster01";
import { starterS01Cards } from "./cardSeries/starterS01";
import { starterS02Cards } from "./cardSeries/starterS02";
import { promoPRCards } from "./cardSeries/promoPR";

export { cardTypes, houses, rarities, seriesOptions };

export const sampleCards = [
  ...booster01Cards,
  ...starterS01Cards,
  ...starterS02Cards,
  ...promoPRCards
];