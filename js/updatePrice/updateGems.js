const gemData = [
  "7레벨 겁화","7레벨 작열",
  "8레벨 겁화","8레벨 작열",
  "9레벨 겁화","9레벨 작열",
  "10레벨 겁화","10레벨 작열"
].map(n => ({ name: n, price: null }));

async function updateGemPrices() {
  const apiToken = document.getElementById("apikey").value.trim();
  if (!apiToken) { alert("API 키를 입력하세요."); return; }

  const url = "https://developer-lostark.game.onstove.com/auctions/items";

  try {
    for (let i = 0; i < gemData.length; i++) {
      const body = {
        ItemLevelMin: 0, ItemLevelMax: 1800,
        Sort: 'BUY_PRICE', CategoryCode: 210000, ItemTier: 4,
        ItemName: `${gemData[i].name}의 보석`,
        PageNo: 1, SortCondition: 'ASC'
      };
      const res = await fetch(url, {
        method: 'POST',
        headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
        body: JSON.stringify(body)
      });
      if (!res.ok) { console.error(await res.text()); throw new Error("보석 API 실패"); }
      const data = await res.json();
      gemData[i].price = data.Items?.[0]?.AuctionInfo?.BuyPrice ?? null;
    }

    renderZeroTable("tbl-gems", ["보석","가격"], gemData);

  } catch (e) {
    alert(e.message || "updateGems 중 오류");
  }
}