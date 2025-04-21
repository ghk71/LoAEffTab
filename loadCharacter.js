function loadCharacter() {
  const name = document.getElementById("charName").value.trim();
  const target = document.getElementById("characterStats");

  if (!name) {
    alert("캐릭터명을 입력하세요.");
    return;
  }

  const data = {
    equipment: {
      parts: ["Head", "Shoulder", "Top", "Bottom", "Gloves", "Weapon"],
      enhance: [21, 21, 21, 21, 21, 25],
      statTransfer: [40, 40, 40, 40, 40, 40],
      transcendence: ["7 | 21", "7 | 21", "7 | 21", "7 | 21", "7 | 21", "7 | 21"],
      grade: ["Ancient", "Ancient", "Ancient", "Ancient", "Ancient", "Ancient"],
      elixir1: ["Atk+5", "Atk+5", "Atk+5", "Atk+5", "Atk+5", ""],
      elixir2: ["Crit+5", "Crit+5", "Crit+5", "Crit+5", "Crit+5", ""],
      electric: ["O", "-", "O", "O", "-", "O"],
    },
    accessories: {
      parts: ["Necklace", "Earring1", "Earring2", "Ring1", "Ring2"],
      option1: Array(5).fill("2% Bonus vs. Low HP"),
      option2: Array(5).fill("2% Bonus vs. Low HP"),
      option3: Array(5).fill("2% Bonus vs. Low HP"),
      stats: Array(5).fill(10000),
      quality: Array(5).fill(90),
    },
    gems: {
      skills: ["A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A"],
      levels: Array(11).fill(9),
      types: Array(11).fill("Explosion"),
    },
    engravings: {
      names: ["Grudge", "Cursed Doll", "Mass Increase", "Keen Blunt", "Raid Captain"],
      artifact: [4, 4, 4, 4, 4],
      stone: [3, 2, 0, 0, 0],
    },
    bracelet: {
      crit: 100,
      spec: 80,
      option1: "Crit Dmg +10%",
      option2: "Crit Dmg +10%",
      option3: "Crit Dmg +10%",
    },
    misc: {
      types: ["Karma", "Leap"],
      levels: [6, 6],
    },
  };

  function makeTable(title, headers, rows) {
    const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<h3>${title}</h3><table>${thead}${tbody}</table>`;
  }

  const html = [];

  // Equipment
  const eq = data.equipment;
  const eqKeys = Object.keys(eq).filter(k => k !== "parts");
  const eqRows = eqKeys.map(k => [k, ...eq[k]]);
  html.push(makeTable("Equipment", ["Category", ...eq.parts], eqRows));

  // Accessories
  const acc = data.accessories;
  const accRows = Object.keys(acc).filter(k => k !== "parts").map(k => [k, ...acc[k]]);
  html.push(makeTable("Accessories", ["Category", ...acc.parts], accRows));

  // Gems
  const gem = data.gems;
  const gemRows = [
    ["Skill", ...gem.skills],
    ["Level", ...gem.levels],
    ["Type", ...gem.types],
  ];
  html.push(makeTable("Gems", ["Property", ...Array.from({ length: gem.skills.length }, (_, i) => `#${i + 1}`)], gemRows));

  // Engravings
  const eng = data.engravings;
  const engRows = [
    ["Artifact", ...eng.artifact],
    ["Stone", ...eng.stone],
  ];
  html.push(makeTable("Engravings", ["Engraving", ...eng.names], engRows));

  // Bracelet
  const br = data.bracelet;
  html.push(makeTable("Bracelet", ["Option", "Value"], [
    ["Crit", br.crit],
    ["Spec", br.spec],
    ["Option1", br.option1],
    ["Option2", br.option2],
    ["Option3", br.option3],
  ]));

  // Misc
  const misc = data.misc;
  html.push(makeTable("Etc", ["Type", ...misc.types], [
    ["Level", ...misc.levels]
  ]));

  target.innerHTML = html.join("<br/>");
}
