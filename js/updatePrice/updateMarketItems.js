const marketData = [
  { name: "운명의 파편", price: null },
  { name: "운명의 수호석", price: null },
  { name: "운명의 파괴석", price: null },
  { name: "운명의 돌파석", price: null },
  { name: "빙하의 숨결", price: null },
  { name: "용암의 숨결", price: null },
  { name: "재봉술 : 업화 [11-14]", price: null },
  { name: "야금술 : 업화 [11-14]", price: null },
  { name: "장인의 재봉술 : 1단계", price: null },
  { name: "장인의 재봉술 : 2단계", price: null },
  { name: "장인의 야금술 : 1단계", price: null },
  { name: "장인의 야금술 : 2단계", price: null },
  { name: "아비도스 융화 재료", price: null }
];

const dealerEngravingData = [
  "아드레날린","원한","예리한 둔기","돌격대장","저주받은 인형","기습의 대가","질량 증가",
  "타격의 대가","결투의 대가","슈퍼 차지","마나 효율 증가",
  "속전속결","바리케이드","안정된 상태","정밀 단도","에테르 포식자"
].map(n => ({ name: `${n} 각인서`, price: null }));

const supportEngravingData = [
  "마나의 흐름","전문의","각성","구슬동자","중갑 착용","급소 타격","최대 마나 증가","폭발물 전문가"
].map(n => ({ name: `${n} 각인서`, price: null }));

async function updateMarketPrices() {
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }

  const marketurl = "https://developer-lostark.game.onstove.com/markets/items";

  try {
    // --- 1) 재료 ---
    let page = 1, items = [];
    while (true) {
      const res = await fetch(marketurl, {
        method: "POST",
        headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
        body: JSON.stringify({
          Sort: "YDAY_AVG_PRICE",
          CategoryCode: 50000,
          ItemTier: 4,
          SortCondition: "ASC",
          PageNo: page
        })
      });

      if (!res.ok) throw new Error("재료 API 실패");
      const data = await res.json();

      items = items.concat(data.Items);
      if (data.TotalCount <= data.PageNo * data.PageSize) break;

      page++;
    }
    items.forEach(({ Name, YDayAvgPrice }) => {
      const tgt = marketData.find(o =>
        o.name === Name ||
        (Name.includes("파편 주머니") && o.name === "운명의 파편")
      );
      if (!tgt) return;
      if (Name.includes("파편 주머니")) {
        const qty = Name.includes("(소)") ? 1000
                  : Name.includes("(중)") ? 2000
                  : 3000;
        tgt.price = ((tgt.price || 0) + YDayAvgPrice / qty);
      } else {
        tgt.price = /수호석|파괴석/.test(Name)
          ? YDayAvgPrice / 10
          : YDayAvgPrice;
      }
    });

    // --- 2) 각인서 ---
    page = 1;
    let engraves = [];
    while (true) {
      const res = await fetch(marketurl, {
        method: "POST",
        headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
        body: JSON.stringify({
          Sort: "YDAY_AVG_PRICE",
          CategoryCode: 40000,
          ItemGrade: "유물",
          SortCondition: "DESC",
          PageNo: page
        })
      });

      if (!res.ok) throw new Error("각인서 API 실패");
      const data = await res.json();

      engraves = engraves.concat(data.Items);
      if (data.TotalCount <= data.PageNo * data.PageSize) break;

      page++;
    }
    engraves.forEach(({ Name, YDayAvgPrice }) => {
      const d = dealerEngravingData.find(e => e.name === Name);
      if (d) d.price = YDayAvgPrice;
      const s = supportEngravingData.find(e => e.name === Name);
      if (s) s.price = YDayAvgPrice;
    });

    // 렌더
    renderZeroTable("tbl-materials",        ["재료","가격"], marketData);
    renderZeroTable("tbl-dealer-engrave",  ["각인서","가격"], dealerEngravingData);
    renderZeroTable("tbl-support-engrave", ["각인서","가격"], supportEngravingData);

  } catch (e) {
    alert(e.message || "updateMarketItems 중 오류");
  }
}