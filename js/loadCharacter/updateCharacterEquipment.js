function updateCharacterEquipment(equipmentArr) {
  const partOrder = { 투구: 0, 어깨: 1, 상의: 2, 하의: 3, 장갑: 4, 무기: 5 };
  const forbidden = [
    "공격력",
    "무기 공격력",
    "힘",
    "민첩",
    "지능",
    "무력화",
    "마나",
    "물약 중독",
    "방랑자",
    "생명의 축복",
    "자원의 축복",
    "탈출의 달인",
    "폭발물 달인",
    "회피의 달인",
  ];

  equipmentArr.slice(0, 6).forEach((item) => {
    const idx = partOrder[item.Type];
    if (idx == null) return;
    const tip = JSON.parse(item.Tooltip);
    const e0 = tip.Element_000?.value || "";
    const e1 = tip.Element_001?.value || {};
    const e5 = tip.Element_005?.value || "";
  
    const e5Text = typeof e5 === "string" ? e5 : "";  // 문자열일 때만 유지
    const hasAdvEnhance = e5Text.includes("상급 재련");

    const type8 = tip.Element_008?.type;
    let transcIdx, elixAIdx, elixBIdx;
    if (type8 === "progress") {
      if (hasAdvEnhance) { transcIdx = 9;  elixAIdx = 10; elixBIdx = 11; }
      else                { transcIdx = 8;  elixAIdx = 9;  elixBIdx = 10; }
    } else if (type8 === "IndentStringGroup") {
      transcIdx = 8;  elixAIdx = 9;  elixBIdx = 10;
    } else {
      // fallback
      if (hasAdvEnhance) { transcIdx = 9;  elixAIdx = 10; elixBIdx = 11; }
      else                { transcIdx = 8;  elixAIdx = 9;  elixBIdx = 10; }
    }

    const idxKey = (n) => `Element_${String(n).padStart(3, "0")}`;
  
    const rawTransc =
      tip[idxKey(transcIdx)]?.value?.Element_000?.topStr || "";
    const elixirSourceA =
      tip[idxKey(elixAIdx)]?.value?.Element_000?.contentStr || {};
    const elixirSourceB =
      tip[idxKey(elixBIdx)]?.value?.Element_000?.contentStr || {};
  
    let lines = [
      ...Object.values(elixirSourceA),
      ...Object.values(elixirSourceB),
    ]
      .map((e) => utils.extractElixirText(e.contentStr))
      .map(utils.cleanElixirTag)
      .filter((v) => v != null);
  
    if (forbidden.some((k) => lines[0]?.includes(k))) {
      lines = [lines[1], lines[0], ...lines.slice(2)];
    }
    if (item.Type === "무기") {
      lines = ["-", "-"];
    }
    if (lines.length > 5) {
      const first = lines.slice(0, 2);
      const rest = lines.slice(2);
      const grouped = [];
      for (let i = 0; i < rest.length; i += 2) {
        if (rest[i + 1] != null) grouped.push(rest[i] + " " + rest[i + 1]);
        else grouped.push(rest[i]);
      }
      lines = [...first, ...grouped];
    }
    lines = lines.slice(0, 5);
  
    characterData.equipment.enhance[idx] = utils.extractEnhance(e0);
    characterData.equipment.advenhance[idx] = utils.extractAdvEnhance(utils.stripTags(e5));
    characterData.equipment.quality[idx] = e1.qualityValue || 0;
    characterData.equipment.grade[idx] = utils.extractGrade(e1.leftStr0 || "");
    characterData.equipment.transcendence[idx] = utils.extractTranscendence(rawTransc);
    characterData.equipment.elixir1[idx] = lines[0] || "-";
    characterData.equipment.elixir2[idx] = lines[1] || "-";
  });
}