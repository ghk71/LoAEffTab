const dealerNeckless = [
  "추피 중단일", "적주피 중단일",
  "추피 중 / 적주피 하", "적주피 중 / 추피 하",
  "추피 상단일", "적주피 상단일",
  "적주피 중 / 추피 중",
  "추피 상 / 적주피 하", "적주피 상 / 추피 하",
  "추피 상 / 적주피 중", "적주피 상 / 추피 중",
  "추피 상 / 적주피 상"
];
const dealerEaring = [
  "무공퍼 중단일", "공퍼 중단일",
  "무공퍼 중 / 공퍼 하", "공퍼 중 / 무공퍼 하",
  "무공퍼 상단일", "공퍼 상단일",
  "공퍼 중 / 무공퍼 중",
  "무공퍼 상 / 공퍼 하", "공퍼 상 / 무공퍼 하",
  "무공퍼 상 / 공퍼 중", "공퍼 상 / 무공퍼 중",
  "무공퍼 상 / 공퍼 상"
];
const dealerRing = [
  "치피 중단일", "치적 중단일",
  "치피 중 / 치적 하", "치적 중 / 치피 하",
  "치피 상단일", "치적 상단일",
  "치적 중 / 치피 중",
  "치피 상 / 치적 하", "치적 상 / 치피 하",
  "치피 상 / 치적 중", "치적 상 / 치피 중",
  "치피 상 / 치적 상"
];

const MAP_DEALER_ACC_VALUE = [
  { name: "추피",   fVal: 7, lVal: 41, low:  70, med: 160, high: 260 },
  { name: "적주피", fVal: 7, lVal: 42, low:  55, med: 120, high: 200 },
  { name: "무공퍼", fVal: 7, lVal: 46, low:  80, med: 180, high: 300 },
  { name: "공퍼",   fVal: 7, lVal: 45, low:  40, med:  95, high: 155 },
  { name: "치피",   fVal: 7, lVal: 50, low: 110, med: 240, high: 400 },
  { name: "치적",   fVal: 7, lVal: 49, low:  40, med:  95, high: 155 },
];

const DEALER_SLOT_META = {
  neck: { code: 200010, awaken: 13, list: dealerNeckless, tableId: "tbl-dealer-neck", label: "목걸이" },
  ear : { code: 200020, awaken: 12, list: dealerEaring , tableId: "tbl-dealer-ear" , label: "귀걸이" },
  ring: { code: 200030, awaken: 12, list: dealerRing   , tableId: "tbl-dealer-ring", label: "반지" }
};

let dealerAccData = allowCounts.map(cnt => ({
  itemAllowCount: cnt,
  neck: [],
  ear: [],
  ring: []
}));

async function updateDealerAcc() {
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }

  // 각 옵션마다 페이지 단위로 한 번씩만 fetchItems 호출 → 0/1/2번 모두 채움
  for (const slotKey of Object.keys(DEALER_SLOT_META)) {
    const { list, tableId, label } = DEALER_SLOT_META[slotKey];

    for (const optionName of list) {
      const bodyBase = buildRequestBody(DEALER_SLOT_META, MAP_DEALER_ACC_VALUE, slotKey, optionName);
      // 각 cnt별 최소가 저장용
      const found = { 0: null, 1: null, 2: null };
      const remaining = new Set(allowCounts);
      let page = 1;

      while (remaining.size > 0) {
        const body = { ...bodyBase, PageNo: page };
        const items = await fetchItems(body, apiToken);
        if (!items.length) break;

        // 남은 cnt들에 대해 한 번에 처리
        for (const cnt of Array.from(remaining)) {
          const prices = items
            .filter(i => (i.AuctionInfo?.TradeAllowCount ?? 0) >= cnt)
            .map(i => i.BuyPrice ?? i.AuctionInfo?.BuyPrice ?? null)
            .filter(p => p != null);

          if (prices.length) {
            found[cnt] = Math.min(...prices);
            remaining.delete(cnt);
          }
        }

        if (remaining.size === 0) break;
        page++;
      }

      // 아직 못 찾은 cnt는 null 그대로
      for (const cnt of allowCounts) {
        dealerAccData[cnt][slotKey].push({
          option: optionName,
          price: found[cnt]
        });
      }
    }

    /*// 테이블에는 itemAllowCount = 0 기준(TradeAllowCount ≥ 0) 최소가로 렌더
    const rows = dealerAccData[0][slotKey].map(o => ({
      name: o.option,
      price: o.price
    }));
    renderZeroTable(tableId, [label, "가격"], rows);
    */

    const sel = parseInt(
        document.querySelector(`input[name="dealer-${slotKey}-allow"]:checked`).value,
        10
      );
      const rows = dealerAccData[sel][slotKey].map(o => ({
        name: o.option,
        price: o.price
      }));
    renderZeroTable(tableId, [label, "가격"], rows);
  }

  alert("딜러 악세 최저가 업데이트 완료!");
}

