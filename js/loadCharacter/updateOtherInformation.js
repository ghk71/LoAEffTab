function updateOtherInformation(data) {
  // 보석
  updateGems(data.ArmoryGem?.Gems || []);

  // 각인
  updateEngravings(data.ArmoryEngraving?.ArkPassiveEffects || []);

  // 카르마
  updateKarma(data.ArkPassive?.Points || []);

  // 팔찌
  updateBracelet(braceletData = data.ArmoryEquipment?.[12]);

  // 아바타
  updateAvatar(data.ArmoryAvatars || []);

  // 카르마 레벨 계산
  computeKarmaLevels();

  // 최종 렌더
  drawCharacterData();
}

function updateGems (gemsArr) {
  const extractSkill = raw => {
    const m = raw.match(/<FONT COLOR='[^']*'>(.*?)<\/FONT>/);
    return m ? m[1].trim() : null;
  };

  const gemList = gemsArr.map(g => {
    const tip = JSON.parse(g.Tooltip);

    /* ── 스킬 이름 분기 ───────────────────────── */
    let skillRaw;
    if (tip.Element_002?.value?.includes("거래가능")) {
      // 특이 케이스: Element_005 쪽에 스킬명
      skillRaw = tip.Element_005?.value?.Element_001 || "";
    } else {
      // 기존 케이스: Element_006 쪽
      skillRaw = tip.Element_006?.value?.Element_001 || "";
    }
    const skill = extractSkill(skillRaw);

    /* ── 종류 구분 ─────────────────────────────── */
    const type = g.Name.includes("홍염") ? "홍염"
               : g.Name.includes("멸화") ? "멸화"
               : g.Name.includes("작열") ? "작열"
               : g.Name.includes("겁화") ? "겁화"
               : null;

    return { skill, level: g.Level, type };
  });

  /* 정렬 */
  const order = { 멸화:0, 겁화:1, 작열:2, 홍염:3 };
  gemList.sort((a,b) =>
    b.level !== a.level ? b.level - a.level
                        : (order[a.type] ?? 4) - (order[b.type] ?? 4)
  );

  const gemCount = 11;
  const skills = gemList.map(g => g.skill);
  const levels = gemList.map(g => g.level);
  const types  = gemList.map(g => g.type);

  // 부족한 칸은 전부 "-" 로 채우기
  while (skills.length < gemCount) {
    skills.push("-");
    levels.push("-");
    types.push("-");
  }

  characterData.gems.skills = gemList.map(g => g.skill);
  characterData.gems.levels = gemList.map(g => g.level);
  characterData.gems.types  = gemList.map(g => g.type);
}


function updateEngravings(engravingArr) {
  const stoneMap = { 1: "1 (Lv.6)", 2: "2 (Lv.7)", 3: "3 (Lv.9)", 4: "4 (Lv.10)" };

  engravingArr.forEach((en, i) => {
    if (i < 5) {
      characterData.engravings.names[i] = en.Name;
      characterData.engravings.level[i] = en.Level;
      characterData.engravings.stoneLevel[i] =
        en.AbilityStoneLevel in stoneMap ? stoneMap[en.AbilityStoneLevel] : "-";
    }
  });
}

function updateKarma(karmaArr) {
  const idxMap = characterData.karma.types.reduce((o, t, i) => ({ ...o, [t]: i }), {});
  karmaArr.forEach((p) => {
    if (idxMap[p.Name] != null) characterData.karma.levels[idxMap[p.Name]] = p.Value;
  });
}

function updateAvatar(avatarData) {
  const avatarPartMap = {
    "머리 아바타": 0,
    "견갑 아바타": 1,
    "상의 아바타": 2,
    "하의 아바타": 3,
    "장갑 아바타": 4,
    "무기 아바타": 5,
  };

  const avatarParts = Array(6).fill("-");
  avatarData.forEach((item) => {
    if (item.Grade === "전설") {
      const idx = avatarPartMap[item.Type];
      if (idx != null) avatarParts[idx] = "전설";
    }
  });
  characterData.equipment.avatar = avatarParts;
}

function updateBracelet(braceletData) {
  const tip = JSON.parse(braceletData.Tooltip);
  const e1 = tip.Element_001?.value || {};

  // grade·tier 먼저
  characterData.bracelet.grade = braceletData.Grade;
  const tierTxt = utils.stripTags(e1.leftStr2 || "");
  const m = tierTxt.match(/아이템\s*티어\s*(\d+)/);
  characterData.bracelet.tier = m ? `티어 ${m[1]}` : "-";

  // 옵션 1~5
  const rawBrace = tip.Element_004?.value?.Element_001 || "";
  const effects = rawBrace
    .split(/<img[^>]*>/i).slice(1)
    .map(seg => seg.split(/<br\s*\/?>/i)
                   .map(utils.stripTags).map(s => s.trim()).join(" "))
    .filter(Boolean).slice(0, 5);

  effects.forEach((ef, i) => {
    characterData.bracelet[`option${i + 1}`] = ef;
  });
}



function computeKarmaLevels() {
  const level = characterData.info.level;               // 실제 캐릭터 레벨
  const idx = t => characterData.karma.types.indexOf(t);

  /* ── 깨달음 ───────────────────────── */
  const kIdx = idx("깨달음");
  if (kIdx !== -1) {
    const total = characterData.karma.levels[kIdx];

    /* ① 레벨 업(50~70, 최대 20) */
    const lvPts = Math.min(Math.max(level - 50, 0), 20);

    /* ② 내실 고정 14 */
    const lifePts = 14;

    /* ③ 악세 포인트 */
    const accPts = (() => {
      const neck  = 0, ear1 = 1, ear2 = 2, ring1 = 3, ring2 = 4;
      const tiers = characterData.accessories.tier;
      const grads = characterData.accessories.grade;
      const val = (i, low, high) => {
        const t = tiers[i], g = grads[i];
        if (t === "티어 4" && g === "고대") return high;
        if ((t === "티어 3" && g === "고대") || (t === "티어 4" && g === "유물")) return low;
        return 0;
      };
      return (
        val(neck, 10, 13) +
        val(ear1, 9, 12) + val(ear2, 9, 12) +
        val(ring1, 9, 12) + val(ring2, 9, 12)
      );
    })();

    /* ④ 남은 게 카르마 레벨 (0~6) */
    const lv     = Math.max(0, Math.min(6, total - (lvPts + lifePts + accPts)));
    characterData.karma.levels[kIdx] = `${total} (${lv})`;
  }

  /* ── 도약 ─────────────────────────── */
  const dIdx = idx("도약");
  if (dIdx !== -1) {
    const total = characterData.karma.levels[dIdx];

    /* ① 레벨 업(50~70, 2점씩, 최대 40) */
    const lvPts = Math.min(Math.max(level - 50, 0) * 2, 40);

    /* ② 팔찌 포인트 */
    const brTier = characterData.bracelet.tier;
    const brGrade = characterData.bracelet.grade;
    const brPts =
      brTier === "티어 4" && brGrade === "고대" ? 18 :
      brTier === "티어 4" && brGrade === "유물" ? 9  : 0;

    /* ③ 남은 게 카르마 레벨 (0~6, 2점씩) */
    const lv     = Math.max(0, Math.min(6, (total - (lvPts + brPts)) / 2));
    characterData.karma.levels[dIdx] = `${total} (${lv})`;
  }
}