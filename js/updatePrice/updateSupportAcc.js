const supportNeckless = [
  "낙인력 중단일", "아덴획득 중단일",
  "낙인력 중 / 아덴획득 하", "아덴획득 중 / 낙인력 하",
  "낙인력 상단일", "아덴획득 상단일",
  "아덴획득 중 / 낙인력 중",
  "낙인력 상 / 아덴획득 하", "아덴획득 상 / 낙인력 하",
  "낙인력 상 / 아덴획득 중", "아덴획득 상 / 낙인력 중",
  "낙인력 상 / 아덴획득 상"
];
const supportEaring = [
  "무공퍼 중단일", "무공+ 중단일",
  "무공퍼 중 / 무공+ 하", "무공+ 중 / 무공퍼 하",
  "무공퍼 상단일", "무공+ 상단일",
  "무공+ 중 / 무공퍼 중",
  "무공퍼 상 / 무공+ 하", "무공+ 상 / 무공퍼 하",
  "무공퍼 상 / 무공+ 중", "무공+ 상 / 무공퍼 중",
  "무공퍼 상 / 무공+ 상"
];
const supportRing = [
  "아공강 중단일", "아피강 중단일",
  "아공강 중 / 아피강 하", "아피강 중 / 아공강 하",
  "아공강 상단일", "아피강 상단일",
  "아피강 중 / 아공강 중",
  "아공강 상 / 아피강 하", "아피강 상 / 아공강 하",
  "아공강 상 / 아피강 중", "아피강 상 / 아공강 중",
  "아공강 상 / 아피강 상"
];

const MAP_SUPPORT_ACC_VALUE = [
  { name: "낙인력",   fVal: 7, lVal: 44, low:  215, med: 480, high: 800 },
  { name: "아덴획득", fVal: 7, lVal: 43, low:  160, med: 360, high: 600 },
  { name: "무공퍼", fVal: 7, lVal: 46, low:  80, med: 180, high: 300 },
  { name: "무공+",   fVal: 7, lVal: 54, low:  195, med:  480, high: 960 },
  { name: "아공강",   fVal: 7, lVal: 51, low: 135, med: 300, high: 500 },
  { name: "아피강",   fVal: 7, lVal: 52, low:  200, med:  450, high: 750 },
]

const SUPPORT_SLOT_META = {
  neck: { code: 200010, awaken: 13, list: supportNeckless, tableId: "tbl-support-neck", label: "목걸이" },
  ear : { code: 200020, awaken: 12, list: supportEaring , tableId: "tbl-support-ear" , label: "귀걸이" },
  ring: { code: 200030, awaken: 12, list: supportRing   , tableId: "tbl-support-ring", label: "반지" }
};

let supportAccData = allowCounts.map(cnt => ({
  itemAllowCount: cnt,
  neck: [],
  ear: [],
  ring: []
}));

async function updateSupportAcc() {
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }

  // 각 옵션마다 페이지 단위로 한 번씩만 fetchItems 호출 → 0/1/2번 모두 채움
  for (const slotKey of Object.keys(SUPPORT_SLOT_META)) {
    const { list, tableId, label } = SUPPORT_SLOT_META[slotKey];

    for (const optionName of list) {
      const bodyBase = buildRequestBody(SUPPORT_SLOT_META, MAP_SUPPORT_ACC_VALUE, slotKey, optionName);
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
        supportAccData[cnt][slotKey].push({
          option: optionName,
          price: found[cnt]
        });
      }
    }

    // 테이블에는 itemAllowCount = 0 기준(TradeAllowCount ≥ 0) 최소가로 렌더
    const rows = supportAccData[0][slotKey].map(o => ({
      name: o.option,
      price: o.price
    }));
    renderZeroTable(tableId, [label, "가격"], rows);
  }

  alert("서포터 악세 최저가 업데이트 완료!");
}