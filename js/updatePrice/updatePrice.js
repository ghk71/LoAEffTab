const allowCounts = [0, 1, 2];

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

async function updateItemAndGems() {
  try {
    await updateMarketPrices();
    await updateGemPrices();
  } finally {
    alert("재료·각인서·보석 가격 업데이트 완료");
  }
}

// 버튼 상태 토글
function toggleBtn(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  if (loading) {
    btn.dataset.origText = btn.textContent;
    btn.textContent = "Loading…";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.origText || btn.textContent;
    btn.disabled = false;
  }
}

function gradeVal(e, grade) {
  return grade === "하" ? e.low
       : grade === "중" ? e.med
       :                 e.high;
}

function buildOpt(mapfile, tok) {
  const [name, g] = tok.trim().split(/\s+/);
  const e = mapfile.find(x => x.name === name);
  return {
    FirstOption:  e.fVal,
    SecondOption: e.lVal,
    MinValue:     gradeVal(e, g),
    MaxValue:     gradeVal(e, g)
  };
}

function etcOptions(mapfile, name, awaken) {
  const out = [{ FirstOption: 8, SecondOption: 1, MinValue: awaken, MaxValue: awaken }];
  name.replace(/단일/, "").split("/").map(s => s.trim())
      .filter(Boolean)
      .forEach(tok => out.push(buildOpt(mapfile, tok)));
  return out;
}

function buildRequestBody(metafile, mapfile, slot, name) {
  const m = metafile[slot];
  return {
    ItemGradeQuality: 70,
    EtcOptions:       etcOptions(mapfile, name, m.awaken),
    Sort:             "BUY_PRICE",
    CategoryCode:     m.code,
    ItemTier:         4,
    ItemGrade:        "고대",
    SortCondition:    "ASC"
  };
}

async function fetchItems(body, token) {
  const res = await fetch("https://developer-lostark.game.onstove.com/auctions/items", {
    method: "POST",
    headers:{'Content-Type':'application/json','Authorization':`bearer ${token}`},
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API 오류 ${res.status}`);
  const data = await res.json();
  return data.Items || [];
}

document.addEventListener("DOMContentLoaded", () => {
  // 초기 테이블 (price null 또는 0)
  renderZeroTable("tbl-materials",        ["재료","가격"], marketData);
  renderZeroTable("tbl-dealer-engrave",  ["각인서","가격"], dealerEngravingData);
  renderZeroTable("tbl-support-engrave", ["각인서","가격"], supportEngravingData);
  renderZeroTable("tbl-gems",            ["보석","가격"], gemData);

  renderZeroTable("tbl-dealer-neck", ["목걸이","가격"], dealerNeckless.map(n=>({ name:n, price:'-' })));
  renderZeroTable("tbl-dealer-ear", ["귀걸이","가격"], dealerNeckless.map(n=>({ name:n, price:'-' })));
  renderZeroTable("tbl-dealer-ring", ["반지","가격"], dealerNeckless.map(n=>({ name:n, price:'-' })));
  renderZeroTable("tbl-support-neck", ["목걸이","가격"], supportNeckless.map(n=>({ name:n, price:'-' })));
  renderZeroTable("tbl-support-ear", ["귀걸이","가격"], supportNeckless.map(n=>({ name:n, price:'-' })));
  renderZeroTable("tbl-support-ring", ["반지","가격"], supportNeckless.map(n=>({ name:n, price:'-' })));

  // 버튼 이벤트
  document.getElementById("btn-update-all")
    .addEventListener("click", () => { toggleBtn("btn-update-all", true); updateItemAndGems().finally(() => toggleBtn("btn-update-all", false)); });
  document.getElementById("btn-update-dealer")
    .addEventListener("click", () => { toggleBtn("btn-update-dealer", true); updateDealerAcc().finally(() => toggleBtn("btn-update-dealer", false)); });
  document.getElementById("btn-update-support")
    .addEventListener("click", () => { toggleBtn("btn-update-support", true); updateSupportAcc().finally(() => toggleBtn("btn-update-support", false)); });
});