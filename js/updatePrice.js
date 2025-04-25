/* updatePrice.js */

/////////////////////////
// 1) 데이터 배열 정의
/////////////////////////

// 마켓(재료)
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

// 분리된 각인서: 딜러 / 서포터
const dealerEngravingData = [
  "아드레날린","원한","예리한 둔기","돌격대장","저주받은 인형","기습의 대가","질량 증가",
  "타격의 대가","결투의 대가","슈퍼 차지","마나 효율 증가",
  "속전속결","바리케이드","안정된 상태","정밀 단도","에테르 포식자"
].map(n => ({ name: `${n} 각인서`, price: null }));

const supportEngravingData = [
  "마나의 흐름","전문의","각성","구슬동자","중갑 착용","급소 타격","최대마나증가","폭발물전문가"
].map(n => ({ name: `${n} 각인서`, price: null }));

// 경매장(보석)
const gemData = [
  "7레벨 겁화","7레벨 작열",
  "8레벨 겁화","8레벨 작열",
  "9레벨 겁화","9레벨 작열",
  "10레벨 겁화","10레벨 작열"
].map(n => ({ name: n, price: null }));

// 딜러 악세 리스트
const dealerNeckless = [
  "추피 중단일", "적주피 중단일",
  "추피 상단일", "적주피 상단일",
  "추피 중 / 적주피 하", "적주피 중 / 추피 하",
  "추피 상 / 적주피 하", "적주피 상 / 추피 하",
  "추피 상 / 적주피 중", "적주피 상 / 적주피 중",
  "추피 상 / 적주피 상", "적주피 중 / 추피 중"
];
const dealerEaring = [
  "무공퍼 중단일", "공퍼 중단일",
  "무공퍼 상단일", "공퍼 상단일",
  "무공퍼 중 / 공퍼 하", "공퍼 중 / 무공퍼 하",
  "무공퍼 상 / 공퍼 하", "공퍼 상 / 무공퍼 하",
  "무공퍼 상 / 공퍼 중", "공퍼 상 / 무공퍼 중",
  "무공퍼 상 / 공퍼 상", "공퍼 중 / 무공퍼 중"
];
const dealerRing = [
  "치피 중단일", "치적 중단일",
  "치피 상단일", "치적 상단일",
  "치피 중 / 치적 하", "치적 중 / 치피 하",
  "치피 상 / 치적 하", "치적 상 / 치피 하",
  "치피 상 / 치적 중", "치적 상 / 치피 중",
  "치피 상 / 치적 상", "치적 중 / 치피 중"
];

// 서포터 악세 리스트
const supportNeckless = [
  "낙인력 중단일", "아덴획득 중단일",
  "낙인력 상단일", "아덴획득 상단일",
  "낙인력 중 / 아덴획득 하", "아덴획득 중 / 낙인력 하",
  "낙인력 상 / 아덴획득 하", "아덴획득 상 / 낙인력 하",
  "낙인력 상 / 아덴획득 중", "아덴획득 상 / 낙인력 중",
  "낙인력 상 / 아덴획득 상", "아덴획득 중 / 낙인력 중"
];
const supportEaring = [
  "무공퍼 중단일", "무공+ 중단일",
  "무공퍼 상단일", "무공+ 상단일",
  "무공퍼 중 / 무공+ 하", "무공+ 중 / 무공퍼 하",
  "무공퍼 상 / 무공+ 하", "무공+ 상 / 무공퍼 하",
  "무공퍼 상 / 무공+ 중", "무공+ 상 / 무공퍼 중",
  "무공퍼 상 / 무공+ 상", "무공+ 중 / 무공퍼 중"
];
const supportRing = [
  "아공강 중단일", "아피강 중단일",
  "아공강 상단일", "아피강 상단일",
  "아공강 중 / 아피강 하", "아피강 중 / 아공강 하",
  "아공강 상 / 아피강 하", "아피강 상 / 아공강 하",
  "아공강 상 / 아피강 중", "아피강 상 / 아공강 중",
  "아공강 상 / 아피강 상", "아피강 중 / 아공강 중"
];


/////////////////////////
// 2) 테이블 렌더러
/////////////////////////
function renderZeroTable(tableId, headers, rows) {
  const tbl = document.getElementById(tableId);
  tbl.innerHTML = "";
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  tbl.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(item => {
    const tr = document.createElement("tr");
    const tdName  = document.createElement("td");
    const tdPrice = document.createElement("td");

    if (typeof item === "object") {
      tdName.textContent  = item.name;
      tdPrice.textContent = item.price != null 
        ? item.price.toLocaleString() 
        : "-";
    } else {
      tdName.textContent  = item;
      tdPrice.textContent = "0";
    }

    tr.appendChild(tdName);
    tr.appendChild(tdPrice);
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
}

// 3) API 호출 함수

// 3-1) 재료 + 각인서 업데이트
async function updateMarketPrices() {
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }
  const url = "https://developer-lostark.game.onstove.com/markets/items";

  try {
    // --- 재료 ---
    let page = 1, items = [];
    while (true) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${apiToken}`
        },
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

    // --- 각인서 ---
    page = 1;
    let engraves = [];
    while (true) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${apiToken}`
        },
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
      // 딜러 각인서
      const d = dealerEngravingData.find(e => e.name === Name);
      if (d) d.price = YDayAvgPrice;
      // 서포터 각인서
      const s = supportEngravingData.find(e => e.name === Name);
      if (s) s.price = YDayAvgPrice;
    });

    // 렌더
    renderZeroTable("tbl-materials",       ["재료","가격"], marketData);
    renderZeroTable("tbl-dealer-engrave", ["각인서","가격"], dealerEngravingData);
    renderZeroTable("tbl-support-engrave",["각인서","가격"], supportEngravingData);
  } catch (e) {
    alert(e.message || "업데이트 중 오류 발생");
  }
}

// 3-2) 보석 업데이트
async function updateAuctionPrices() {
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }
  const url = "https://developer-lostark.game.onstove.com/auctions/items";
  const gemNames = [
    "7레벨 겁화의 보석", "7레벨 작열의 보석",
    "8레벨 겁화의 보석", "8레벨 작열의 보석",
    "9레벨 겁화의 보석", "9레벨 작열의 보석",
    "10레벨 겁화의 보석", "10레벨 작열의 보석"
  ];

  try {
    for(let i=0;i<gemNames.length;i++){
      const body={
        ItemLevelMin:0,ItemLevelMax:1800,Sort:'BUY_PRICE',
        CategoryCode:210000,ItemTier:4,
        ItemName:gemNames[i],PageNo:1,SortCondition:'ASC'
      };
      const res=await fetch(url,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
        body:JSON.stringify(body)
      });
      if(!res.ok){console.error(await res.text());return alert("경매장 API 실패");}
      const data=await res.json();
      gemData[i].price=data.Items?.[0]?.AuctionInfo?.BuyPrice??null;
    }

    renderZeroTable("tbl-gems", ["보석", "가격"], gemData);
  } catch (e) {
    alert(e.message || "업데이트 중 오류 발생");
  }
}

/////////////////////////
// 4) 통합 업데이트 & 기타 버튼
/////////////////////////
function toggleBtn(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  if (loading) {
    btn.dataset.origText = btn.textContent;
    btn.textContent = "Loading…";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.origText || "Update Price";
    btn.disabled = false;
  }
}

async function updateAll() {
  toggleBtn("btn-update-all", true);
  try {
    await updateMarketPrices();
    await updateAuctionPrices();
  } finally {
    toggleBtn("btn-update-all", false);
    alert("재료·각인서·보석 가격 업데이트 완료");
  }
}

async function updateDealer() { 
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }
  const url = "https://developer-lostark.game.onstove.com/auctions/options";

  try {
    const res=await fetch(url,{
      method:'GET',
      headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
    });
    const data = await res.json();
    console.log(data);
    
  } catch (e) {
    alert(e.message || "업데이트 중 오류 발생");
  }

}

async function updateSupport() { 
  fetch('/.netlify/functions/crawl')
  .then(res => res.text())
  .then(html => {
    console.log("받아온 HTML:", html);
    // 필요한 데이터 뽑아서 DOM 조작하면 됨
  })
  .catch(err => {
    console.error("크롤링 실패:", err);
  });

}

// 5) 초기 렌더 & 버튼 바인딩
document.addEventListener("DOMContentLoaded", () => {
  // 상단 초기화
  renderZeroTable("tbl-materials",        ["재료","가격"], marketData);
  renderZeroTable("tbl-dealer-engrave",  ["각인서","가격"], dealerEngravingData);
  renderZeroTable("tbl-support-engrave", ["각인서","가격"], supportEngravingData);
  renderZeroTable("tbl-gems",            ["보석","가격"], gemData);

  // 딜러/서포터 악세 (가격 0)
  renderZeroTable(
    "tbl-dealer-neck", ["목걸이","가격"],
    dealerNeckless.map(n => ({ name: n, price: 0 }))
  );
  renderZeroTable(
    "tbl-dealer-ear", ["귀걸이","가격"],
    dealerEaring.map(n => ({ name: n, price: 0 }))
  );
  renderZeroTable(
    "tbl-dealer-ring", ["반지","가격"],
    dealerRing.map(n => ({ name: n, price: 0 }))
  );
  renderZeroTable(
    "tbl-support-neck", ["목걸이","가격"],
    supportNeckless.map(n => ({ name: n, price: 0 }))
  );
  renderZeroTable(
    "tbl-support-ear", ["귀걸이","가격"],
    supportEaring.map(n => ({ name: n, price: 0 }))
  );
  renderZeroTable(
    "tbl-support-ring", ["반지","가격"],
    supportRing.map(n => ({ name: n, price: 0 }))
  );

  // 버튼 이벤트
  document.getElementById("btn-update-all")
    .addEventListener("click", updateAll);
  document.getElementById("btn-update-dealer")
    .addEventListener("click", updateDealer);
  document.getElementById("btn-update-support")
    .addEventListener("click", updateSupport);
});