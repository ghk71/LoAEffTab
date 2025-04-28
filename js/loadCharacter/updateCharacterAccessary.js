function updateCharacterAccessary(accData) {
  const partIdx = [
    { i: 6, p: "목걸이"  },
    { i: 7, p: "귀걸이", a: 1 },
    { i: 8, p: "귀걸이", a: 2 },
    { i: 9, p: "반지",   a: 1 },
    { i: 10,p: "반지",   a: 2 },
  ];

  const cls = characterData.info.class;
  const mainStat = mainStatByClass[cls] || "힘";

  partIdx.forEach((o, arrIdx) => {
    const it = accData[o.i];
    if (!it) return;

    const tip = JSON.parse(it.Tooltip);
    const e1 = tip.Element_001?.value || {};
    const e4 = tip.Element_004?.value?.Element_001 || "";
    const e5 = tip.Element_005?.value?.Element_001 || "";

    const rawOpts = e5                       // <img> 로 split 해서 텍스트 추출한 배열
      .split(/<img[^>]*>/i).slice(1)
      .map(utils.stripTags).map(s => s.trim())
      .filter(Boolean);

    const prio = optionPriority[o.p] || [];
    rawOpts.sort((a, b) => {
      const ia = prio.findIndex(k => a.includes(k));
      const ib = prio.findIndex(k => b.includes(k));
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    /* 등급 라벨 + 색 입히기 후 앞에서 3개만 */
    const optLines = rawOpts
      .slice(0, 3)
      .map(t => utils.classifyOption(o.p, t));

    characterData.accessories.option1[arrIdx] = optLines[0] || "-";
    characterData.accessories.option2[arrIdx] = optLines[1] || "-";
    characterData.accessories.option3[arrIdx] = optLines[2] || "-";

    /* stats */
    const statLines = (tip.Element_004?.value?.Element_001 || "")
      .split(/<br\s*\/?>/i)          // ① 줄 자르기
      .map(utils.stripTags)          // ② 태그 제거
      .map(s => s.trim())            // ③ 공백 정리
      .filter(Boolean);              // ④ 빈 줄 제거

    const mainLine = statLines.find(l => l.startsWith(mainStat)); // 힘 / 민첩 / 지능 중 하나
    characterData.accessories.stats[arrIdx] = mainLine || "-";

    /* quality */
    characterData.accessories.quality[arrIdx] = e1.qualityValue ?? 0;

    /* grade */
    characterData.accessories.grade[arrIdx] = it.Grade || "-";

    /* tier */
    const tierTxt = utils.stripTags(e1.leftStr2 || "");
    const m = tierTxt.match(/아이템\s*티어\s*(\d+)/);
    characterData.accessories.tier[arrIdx] = m ? `티어 ${m[1]}` : "-";
  });
}