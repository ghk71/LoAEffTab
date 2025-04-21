document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("efficiency-table-wrapper");

  const data = [
    ["무공치피 -> 공치피", 4.1, 0.09, 30000, 7317.07, 81300.78],
    ["포마절타 8->9작", 23.13, 0.18, 520650, 22509.73, 125054.06],
    ["포샷 8->9겁", 22, 0.5631, 513750, 23352.27, 41470.91],
    ["절멸 8->9겁", 19.82, 0.5109, 513750, 25920.79, 50735.55],
    ["타다 8->9겁", 18.24, 0.4732, 513750, 28166.12, 59522.65],
    ["대재앙 8->9겁", 12.67, 0.3398, 513750, 40548.54, 119330.61],
    ["레오불 8->9겁", 12.31, 0.3311, 513750, 41734.36, 126047.6],
    ["샷연 8->9겁", 9.89, 0.2731, 513750, 51946.41, 190210.22],
    ["방어구 22 -> 23강", 7.5, 1.1, 421424.08, 56189.88, 51081.71],
    ["상상 귀걸이", 16.56, 0.53, 958000, 57850.24, 109151.4]
  ];

  const headers = [
    "스펙업요소", "로펙점수상승치", "딜증효율", "필요 골드",
    "로펙1점당골드", "효율1%당골드"
  ];

  let sortDir = { 4: "asc", 5: "asc" };

  function renderTable(sortCol = null) {
    if (sortCol !== null) {
      data.sort((a, b) =>
        sortDir[sortCol] === "asc" ? a[sortCol] - b[sortCol] : b[sortCol] - a[sortCol]
      );
      sortDir[sortCol] = sortDir[sortCol] === "asc" ? "desc" : "asc";
    }

    const table = document.createElement("table");
    table.className = "efficiency-table";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headRow = document.createElement("tr");
    headers.forEach((h, i) => {
      const th = document.createElement("th");
      th.textContent = h;
      if (i === 4 || i === 5) {
        const arrow = document.createElement("span");
        arrow.textContent = sortDir[i] === "asc" ? " 🔼" : " 🔽";
        arrow.style.cursor = "pointer";
        arrow.onclick = () => renderTable(i);
        th.appendChild(arrow);
      }
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    data.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = typeof cell === "number" ? cell.toLocaleString() : cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
  }

  renderTable();
});
