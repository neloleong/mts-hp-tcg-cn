import { useEffect, useMemo, useState } from "react";
import CardGrid from "../CardGrid";
import CardModal from "../CardModal";
import { rarities, seriesOptions, sampleCards } from "../../data/cards";
import { products } from "../../data/products";
import { hasSupabaseConfig, supabase } from "../../lib/supabaseClient";

const CARD_TYPE_OPTIONS = ["全部", "角色卡", "事件卡", "道具卡", "地點卡", "Magic 卡", "夥伴卡"];

const TAG_OPTIONS = [
  "葛來分多",
  "史萊哲林",
  "雷文克勞",
  "赫夫帕夫",
  "霍格華茲",
  "麻瓜",
  "德思禮一家",
  "魁地奇",
  "教師",
  "魔女",
  "魔法使",
  "魔法生物",
  "幽靈",
  "小鬼",
  "手紙",
  "肖像畫",
  "巨怪"
];

const COST_OPTIONS = ["全部", "-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const MP_OPTIONS = ["全部", "-", "1"];
const AP_OPTIONS = ["全部", "-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const DP_OPTIONS = ["全部", "-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const MAGIC_ICON_OPTIONS = ["全部", "Magic"];
const PARALLEL_OPTIONS = ["全部", "平行卡のみ", "平行卡を除く"];

function normalizeTags(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[／,/，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function inferSeries(cardNo, product) {
  if (product === "booster-philosophers-stone-part-1") return "booster-01";
  if (product === "starter-gryffindor") return "starter-s01";
  if (product === "starter-slytherin") return "starter-s02";
  if (product === "promo-pr") return "promo-pr";

  if (cardNo.startsWith("S01")) return "starter-s01";
  if (cardNo.startsWith("S02")) return "starter-s02";
  if (cardNo.startsWith("PR")) return "promo-pr";
  if (cardNo.startsWith("01") || cardNo.startsWith("Pt") || cardNo.startsWith("MP")) return "booster-01";

  return "";
}

function normalizeCard(row) {
  const cardNo = row.card_no || row.cardNo || "";
  const product = row.product || row.product_id || row.productId || "";

  return {
    id: row.id?.toString() || cardNo,
    cardNo,
    nameZh: row.name_zh || row.nameZh || "未命名卡牌",
    nameJp: row.name_jp || row.nameJp || "",
    nameEn: row.name_en || row.nameEn || "",
    nameOriginal:
      row.name_original ||
      row.nameOriginal ||
      row.name_jp ||
      row.nameJp ||
      row.name_en ||
      row.nameEn ||
      "",
    type: row.card_type || row.type || "其他",
    house: row.house || "中立",
    rarity: row.rarity || (cardNo.startsWith("S0") ? "ST" : cardNo.startsWith("PR") ? "PR" : "N"),
    cost: row.cost === null || row.cost === undefined || row.cost === "" ? "" : Number(row.cost),
    mp: row.mp === null || row.mp === undefined || row.mp === "" ? "" : Number(row.mp),
    ap: row.ap === null || row.ap === undefined || row.ap === "" ? "" : Number(row.ap),
    dp: row.dp === null || row.dp === undefined || row.dp === "" ? "" : Number(row.dp),
    tags: normalizeTags(row.tags || row.tag || row.labels),
    product,
    series: row.series || row.series_id || row.seriesId || inferSeries(cardNo, product),
    imageUrl: row.image_url || row.imageUrl || row.image || "",
    image: row.image || row.image_url || row.imageUrl || "",
    effectZh: row.effect_zh || row.effectZh || "",
    effectOriginal: row.effect_original || row.effectOriginal || "",
    isParallel:
      Boolean(row.is_parallel) ||
      Boolean(row.isParallel) ||
      /[a-z]$/i.test(cardNo)
  };
}

function valueToNumberFilter(value) {
  if (value === "全部") return "全部";
  if (value === "-") return "";
  return Number(value);
}

function matchTypeFilter(cardType, selectedType) {
  if (selectedType === "全部") return true;

  return (
    cardType === selectedType ||
    (selectedType === "角色卡" && cardType.includes("角色")) ||
    (selectedType === "事件卡" && cardType.includes("事件")) ||
    (selectedType === "道具卡" && cardType.includes("道具")) ||
    (selectedType === "地點卡" && cardType.includes("地點")) ||
    (selectedType === "Magic 卡" && cardType.toLowerCase().includes("magic")) ||
    (selectedType === "夥伴卡" && cardType.includes("夥伴"))
  );
}

function CardListPage() {
  const [cards, setCards] = useState(sampleCards.map(normalizeCard));
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [product, setProduct] = useState("all");
  const [series, setSeries] = useState("all");

  const [type, setType] = useState("全部");
  const [tagMode, setTagMode] = useState("AND");
  const [selectedTags, setSelectedTags] = useState([]);

  const [cost, setCost] = useState("全部");
  const [mp, setMp] = useState("全部");
  const [ap, setAp] = useState("全部");
  const [dp, setDp] = useState("全部");
  const [magicIcon, setMagicIcon] = useState("全部");
  const [rarity, setRarity] = useState("全部");
  const [parallel, setParallel] = useState("全部");

  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    async function loadCards() {
      if (!hasSupabaseConfig || !supabase) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("hp_tcg_cards")
        .select("*")
        .order("card_no", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        setCards(data.map(normalizeCard));
      }

      setLoading(false);
    }

    loadCards();
  }, []);

  function toggleTag(tag) {
    if (tag === "全部") {
      setSelectedTags([]);
      return;
    }

    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }

      return [...current, tag];
    });
  }

  function matchNumber(cardValue, selectedValue) {
    const target = valueToNumberFilter(selectedValue);

    if (target === "全部") return true;
    if (target === "") {
      return cardValue === "" || cardValue === null || cardValue === undefined;
    }

    return Number(cardValue) === target;
  }

  const activeConditionCount = useMemo(() => {
    let count = 0;

    if (type !== "全部") count += 1;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (cost !== "全部") count += 1;
    if (mp !== "全部") count += 1;
    if (ap !== "全部") count += 1;
    if (dp !== "全部") count += 1;
    if (magicIcon !== "全部") count += 1;
    if (rarity !== "全部") count += 1;
    if (parallel !== "全部") count += 1;

    return count;
  }, [type, selectedTags, cost, mp, ap, dp, magicIcon, rarity, parallel]);

  const filteredCards = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return cards.filter((card) => {
      const cardTags = Array.isArray(card.tags) ? card.tags : [];

      const searchableText = [
        card.cardNo,
        card.nameZh,
        card.nameJp,
        card.nameEn,
        card.nameOriginal,
        card.type,
        card.house,
        card.rarity,
        card.product,
        card.series,
        cardTags.join(" "),
        card.effectZh,
        card.effectOriginal
      ]
        .join(" ")
        .toLowerCase();

      const matchKeyword = !q || searchableText.includes(q);
      const matchProduct = product === "all" || card.product === product;
      const matchSeries = series === "all" || card.series === series;
      const matchType = matchTypeFilter(card.type, type);

      const matchTags =
        selectedTags.length === 0 ||
        (tagMode === "AND"
          ? selectedTags.every((tag) => cardTags.includes(tag) || card.house === tag)
          : selectedTags.some((tag) => cardTags.includes(tag) || card.house === tag));

      const matchCost = matchNumber(card.cost, cost);
      const matchMp = matchNumber(card.mp, mp);
      const matchAp = matchNumber(card.ap, ap);
      const matchDp = matchNumber(card.dp, dp);

      const matchMagicIcon =
        magicIcon === "全部" ||
        card.type.toLowerCase().includes("magic") ||
        card.effectZh.includes("Magic") ||
        card.effectOriginal.includes("Magic");

      const matchRarity = rarity === "全部" || card.rarity === rarity;

      const matchParallel =
        parallel === "全部" ||
        (parallel === "平行卡のみ" && card.isParallel) ||
        (parallel === "平行卡を除く" && !card.isParallel);

      return (
        matchKeyword &&
        matchProduct &&
        matchSeries &&
        matchType &&
        matchTags &&
        matchCost &&
        matchMp &&
        matchAp &&
        matchDp &&
        matchMagicIcon &&
        matchRarity &&
        matchParallel
      );
    });
  }, [
    cards,
    keyword,
    product,
    series,
    type,
    selectedTags,
    tagMode,
    cost,
    mp,
    ap,
    dp,
    magicIcon,
    rarity,
    parallel
  ]);

  function resetFilters() {
    setKeyword("");
    setProduct("all");
    setSeries("all");
    setType("全部");
    setTagMode("AND");
    setSelectedTags([]);
    setCost("全部");
    setMp("全部");
    setAp("全部");
    setDp("全部");
    setMagicIcon("全部");
    setRarity("全部");
    setParallel("全部");
  }

  function closeConditionModalByBackdrop(event) {
    if (event.target === event.currentTarget) {
      setShowConditionModal(false);
    }
  }

  return (
    <section className="page-section card-list-page">
      <div className="official-card-title">
        <div className="official-title-small">卡牌列表</div>
        <h1>CARD LIST</h1>
        <div className="official-title-line" />
      </div>

      <div className="official-filter-panel simple-filter-panel">
        <div className="official-filter-top">
          <label className="official-input-block">
            <span>◆ Free Word 搜尋</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜尋關鍵字を入力"
            />
          </label>

          <label className="official-input-block">
            <span>◆ 收錄商品</span>
            <select value={product} onChange={(event) => setProduct(event.target.value)}>
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="official-input-block">
            <span>◆ 系列</span>
            <select value={series} onChange={(event) => setSeries(event.target.value)}>
              {seriesOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="official-filter-bottom-line">
          <button
            type="button"
            className="official-add-condition"
            onClick={() => setShowConditionModal(true)}
          >
            搜尋條件を追加 +
            {activeConditionCount > 0 && (
              <span className="condition-count">{activeConditionCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="official-search-actions">
        <button type="button" className="official-search-btn">
          搜尋する <span>▶</span>
        </button>

        <button type="button" className="official-reset-btn" onClick={resetFilters}>
          搜尋條件をリセット
        </button>
      </div>

      {(activeConditionCount > 0 || series !== "all" || product !== "all") && (
        <div className="active-condition-bar">
          <strong>已套用條件：</strong>

          {product !== "all" && (
            <span>
              收錄：
              {products.find((item) => item.id === product)?.name || product}
            </span>
          )}

          {series !== "all" && (
            <span>
              系列：
              {seriesOptions.find((item) => item.id === series)?.name || series}
            </span>
          )}

          {type !== "全部" && <span>{type}</span>}

          {selectedTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}

          {cost !== "全部" && <span>Cost：{cost}</span>}
          {mp !== "全部" && <span>MP：{mp}</span>}
          {ap !== "全部" && <span>AP：{ap}</span>}
          {dp !== "全部" && <span>DP：{dp}</span>}
          {magicIcon !== "全部" && <span>Magic Icon：{magicIcon}</span>}
          {rarity !== "全部" && <span>稀有度：{rarity}</span>}
          {parallel !== "全部" && <span>{parallel}</span>}
        </div>
      )}

      <div className="result-bar official-result-bar">
        <strong>搜尋結果：{filteredCards.length} 張</strong>
        {loading && <span>正在讀取 Supabase 資料……</span>}
      </div>

      <CardGrid cards={filteredCards} onOpen={setSelectedCard} />

      {showConditionModal && (
        <div className="condition-modal-backdrop" onClick={closeConditionModalByBackdrop}>
          <div className="condition-modal">
            <button
              type="button"
              className="condition-modal-close"
              onClick={() => setShowConditionModal(false)}
            >
              ×
            </button>

            <div className="condition-modal-title">
              <span>追加搜尋條件</span>
              <h2>SEARCH CONDITIONS</h2>
            </div>

            <div className="condition-modal-body">
              <div className="official-filter-group">
                <div className="official-filter-heading">◆ 卡片類型</div>
                <div className="official-button-row">
                  {CARD_TYPE_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={type === item ? "active" : ""}
                      onClick={() => setType(item)}
                    >
                      {item === "全部" ? "すべて" : item.replace("卡", "")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="official-filter-group">
                <div className="official-filter-heading">
                  ◆ 標籤
                  <span className="tag-mode-control">
                    <label>
                      <input
                        type="radio"
                        checked={tagMode === "AND"}
                        onChange={() => setTagMode("AND")}
                      />
                      AND検索
                    </label>

                    <label>
                      <input
                        type="radio"
                        checked={tagMode === "OR"}
                        onChange={() => setTagMode("OR")}
                      />
                      OR検索
                    </label>
                  </span>
                </div>

                <div className="official-button-row tag-row-large">
                  <button
                    type="button"
                    className={selectedTags.length === 0 ? "active" : ""}
                    onClick={() => toggleTag("全部")}
                  >
                    すべて
                  </button>

                  {TAG_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={selectedTags.includes(item) ? "active" : ""}
                      onClick={() => toggleTag(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <FilterButtonGroup
                title="◆ Cost"
                options={COST_OPTIONS}
                value={cost}
                onChange={setCost}
              />

              <FilterButtonGroup
                title="◆ MP"
                options={MP_OPTIONS}
                value={mp}
                onChange={setMp}
              />

              <FilterButtonGroup
                title="◆ AP"
                options={AP_OPTIONS}
                value={ap}
                onChange={setAp}
              />

              <FilterButtonGroup
                title="◆ DP"
                options={DP_OPTIONS}
                value={dp}
                onChange={setDp}
              />

              <FilterButtonGroup
                title="◆ Magic Icon"
                options={MAGIC_ICON_OPTIONS}
                value={magicIcon}
                onChange={setMagicIcon}
              />

              <FilterButtonGroup
                title="◆ 稀有度"
                options={rarities}
                value={rarity}
                onChange={setRarity}
                labelMap={{ 全部: "すべて" }}
              />

              <FilterButtonGroup
                title="◆ Parallel"
                options={PARALLEL_OPTIONS}
                value={parallel}
                onChange={setParallel}
                labelMap={{ 全部: "すべて" }}
              />
            </div>

            <div className="condition-modal-actions">
              <button
                type="button"
                className="condition-apply-btn"
                onClick={() => setShowConditionModal(false)}
              >
                套用條件
              </button>

              <button type="button" className="condition-clear-btn" onClick={resetFilters}>
                清除所有條件
              </button>
            </div>
          </div>
        </div>
      )}

      <CardModal
        card={selectedCard}
        products={products}
        onClose={() => setSelectedCard(null)}
      />
    </section>
  );
}

function FilterButtonGroup({ title, options, value, onChange, labelMap = {} }) {
  return (
    <div className="official-filter-group">
      <div className="official-filter-heading">{title}</div>

      <div className="official-button-row small-value-row">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            className={value === item ? "active" : ""}
            onClick={() => onChange(item)}
          >
            {labelMap[item] || item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CardListPage;