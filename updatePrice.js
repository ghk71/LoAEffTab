/* ───────────────── updatePrice.js (2025‑04‑22 rev2) ───────────────── */
const containerId = "content-database";

/* ---------- 초기 데이터 ---------- */
let marketData = [
  { name:"운명의 파편", price:null },{ name:"운명의 수호석", price:null },
  { name:"운명의 파괴석", price:null },{ name:"운명의 돌파석", price:null },
  { name:"빙하의 숨결", price:null },{ name:"용암의 숨결", price:null },
  { name:"재봉술 : 업화 [11-14]", price:null },{ name:"야금술 : 업화 [11-14]", price:null },
  { name:"장인의 재봉술 : 1단계", price:null },{ name:"장인의 재봉술 : 2단계", price:null },
  { name:"장인의 야금술 : 1단계", price:null },{ name:"장인의 야금술 : 2단계", price:null },
  { name:"아비도스 융화 재료", price:null },
];

let engravingData = [
  "아드레날린","원한","예리한 둔기","돌격대장","저주받은 인형","기습의 대가","질량 증가",
  "타격의 대가","결투의 대가","슈퍼 차지","마나의 흐름","전문의","각성","마나 효율 증가",
  "구슬동자","속전속결","바리케이드","안정된 상태","중갑 착용","정밀 단도","급소 타격","에테르 포식자",
].map(n=>({ name:`${n} 각인서`, price:null }));

let gemData = [
  "7레벨 겁화","7레벨 작열","8레벨 겁화","8레벨 작열",
  "9레벨 겁화","9레벨 작열","10레벨 겁화","10레벨 작열",
].map(n=>({ name:n, price:null }));

let accessoryData = [
  "목걸이 중단일","귀걸이 중단일","반지 중단일",
  "목걸이 상단일","귀걸이 상단일","반지 상단일",
  "목걸이 상하","귀걸이 상하","반지 상하",
  "목걸이 상중","귀걸이 상중","반지 상중",
  "목걸이 상상","귀걸이 상상","반지 상상",
].map(n=>({ name:n, price:0 }));

/* ---------- 테이블 렌더링 ---------- */
const sortState={}; // id -> {col,dir}
function renderTable(title,data,id){
  const state=sortState[id]||{col:null,dir:1};
  if(state.col!==null){
    data.sort((a,b)=>{
      if(state.col===0) return state.dir*a.name.localeCompare(b.name);
      return state.dir*((a.price??Infinity)-(b.price??Infinity));
    });
  }

  const arrowClass=(col)=>{
    if(state.col!==col) return "";
    return state.dir===1?" asc":" desc";
  };

  const rows=data.map(d=>{
    /* 보석 표면 행에 색상 클래스 부여 */
    let extraCls="";
    if(id==="tbl-gem"){
      if(d.name.includes("겁화"))  extraCls=" gem-phwa";
      if(d.name.includes("작열"))  extraCls=" gem-jagyeol";
    }
    return `
      <tr class="${extraCls.trim()}">
        <td>${d.name}</td>
        <td>${d.price!==null?d.price.toLocaleString():"-"}</td>
      </tr>`;
  }).join("");

  return `
  <div class="data-table" id="${id}">
    <h3>${title}</h3>
    <table>
      <thead><tr>
        <th class="sortable${arrowClass(0)}" data-col="0">이름</th>
        <th class="sortable${arrowClass(1)}" data-col="1">가격</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function attachSortEvents(){
  document.querySelectorAll(`#${containerId} th.sortable`).forEach(th=>{
    th.onclick=()=>{
      const tbl=th.closest(".data-table");
      const id=tbl.id, col=Number(th.dataset.col);
      const cur=sortState[id]||{col:null,dir:1};
      sortState[id]={col,dir:cur.col===col?-cur.dir:1};
      drawDatabase();
    };
  });
}

function toggleBtn(btnId,loading){
  const btn=document.getElementById(btnId);
  if(!btn) return;
  if(loading){
    btn.dataset.origText=btn.textContent;
    btn.textContent="Loading…";
    btn.disabled=true;
  }else{
    btn.textContent=btn.dataset.origText||"DONE";
    btn.disabled=false;
  }
}


/* ---------- 화면 그리기 ---------- */
function drawDatabase(){
  const html=`
    <div class="database-button-bar">
      <button id="updateMarketBtn"  onclick="updateMarketPrices()">updateMarketPrices</button>
      <button id="updateAuctionBtn" onclick="updateAuctionPrices()">updateAuctionPrices</button>
    </div>
    <div class="market-auction-container">
      <div class="market-section">
        ${renderTable("📦 아이템 시세", marketData,   "tbl-market")}
        ${renderTable("📜 유각 시세",  engravingData,"tbl-engrave")}
      </div>
      <div class="auction-section">
        ${renderTable("💎 보석 시세",  gemData,      "tbl-gem")}
        ${renderTable("💍 악세 시세",  accessoryData,"tbl-acc")}
      </div>
    </div>`;
  document.getElementById(containerId).innerHTML=html;
  attachSortEvents();
}

/* ---------- 마켓(재료·각인서) 호출 ---------- */
async function updateMarketPrices(){
  toggleBtn("updateMarketBtn",true);

  try{
    const apiToken=document.getElementById("apikey").value.trim();
  if(!apiToken){alert("API 키 넣어라");return;}

  const url='https://developer-lostark.game.onstove.com/markets/items';

  /* 재료 */
  let page=1, items=[];
  while(true){
    const res=await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
      body:JSON.stringify({
        Sort:'YDAY_AVG_PRICE',CategoryCode:50000,ItemTier:4,
        SortCondition:'ASC',PageNo:page
      })
    });
    if(!res.ok){console.error(await res.text());return alert("재료 API 실패");}
    const data=await res.json();
    items=items.concat(data.Items);
    if(data.TotalCount<=data.PageNo*data.PageSize) break;
    page++;
  }

  items.forEach(({Name,YDayAvgPrice})=>{
    const tgt=marketData.find(o=>o.name===Name||
      (Name.includes("파편 주머니") && o.name==="운명의 파편"));
    if(!tgt) return;
    if(Name.includes("파편 주머니")){
      const qty=Name.includes("(소)")?1000:Name.includes("(중)")?2000:3000;
      tgt.price=((tgt.price||0)+YDayAvgPrice/qty);
    }else tgt.price=/수호석|파괴석/.test(Name)?YDayAvgPrice/10:YDayAvgPrice;
  });

  /* 각인서 */
  page=1; let engraves=[];
  while(true){
    const res=await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
      body:JSON.stringify({
        Sort:'YDAY_AVG_PRICE',CategoryCode:40000,ItemGrade:'유물',
        SortCondition:'DESC',PageNo:page
      })
    });
    if(!res.ok){console.error(await res.text());return alert("각인서 API 실패");}
    const data=await res.json();
    engraves=engraves.concat(data.Items);
    if(data.TotalCount<=data.PageNo*data.PageSize) break;
    page++;
  }
  engraves.forEach(({Name,YDayAvgPrice})=>{
    const tgt=engravingData.find(e=>e.name===Name);
    if(tgt) tgt.price=YDayAvgPrice;
  });

  alert("마켓 가격 업데이트 완료");
  } catch(e) {
    alert(e.message||"에러");
  } finally {
    toggleBtn("updateMarketBtn",false);
    drawDatabase();
  }
}

/* ---------- 경매장(보석) 호출 ---------- */
async function updateAuctionPrices(){
  toggleBtn("updateAuctionBtn",true);

  try{
    const apiToken=document.getElementById("apikey").value.trim();
  if(!apiToken){alert("API 키 넣어라");return;}

  const url='https://developer-lostark.game.onstove.com/auctions/items';
  const gemNames=[
    '7레벨 겁화의 보석','7레벨 작열의 보석',
    '8레벨 겁화의 보석','8레벨 작열의 보석',
    '9레벨 겁화의 보석','9레벨 작열의 보석',
    '10레벨 겁화의 보석','10레벨 작열의 보석',
  ];

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

  alert("보석 가격 업데이트 완료");
  } catch(e) {
    alert(e.message||"에러");
  } finally {
    toggleBtn("updateAuctionBtn",false);
    drawDatabase();
  }
}

/* ---------- 첫 화면 ---------- */
document.addEventListener("DOMContentLoaded",drawDatabase);
window.updateMarketPrices=updateMarketPrices;
window.updateAuctionPrices=updateAuctionPrices;
