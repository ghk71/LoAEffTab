const characterData = {
  info: { name: null, class: null, itemlevel: 0, level: 0, expedition: 0 },
  equipment: {
    parts: ["머리", "견갑", "상의", "하의", "장갑", "무기"],
    enhance: Array(6).fill(0),
    advenhance: Array(6).fill(0),
    quality: Array(6).fill(0),
    transcendence: Array(6).fill(null),
    grade: Array(6).fill(null),
    elixir1: Array(6).fill(null),
    elixir2: Array(6).fill(null),
    avatar: Array(6).fill(null),
  },
  accessories: {
    parts: ["목걸이", "귀걸이1", "귀걸이2", "반지1", "반지2"],
    option1: Array(5).fill(null),
    option2: Array(5).fill(null),
    option3: Array(5).fill(null),
    stats: Array(5).fill(null),
    quality: Array(5).fill(null),
  },
  gems: {
    skills: Array(11).fill(null),
    levels: Array(11).fill(0),
    types: Array(11).fill(null),
  },
  engravings: {
    names: Array(5).fill(null),
    level: Array(5).fill(0),
    stoneLevel: Array(5).fill(0),
  },
  bracelet: { option1: null, option2: null, option3: null, option4: null, option5: null },
  karma: { types: ["진화", "깨달음", "도약"], levels: [0, 0, 0] },
};

const utils = {
  stripTags: s => (typeof s === "string" ? s.replace(/<[^>]*>/g, "").trim() : ""),
  extractEnhance: s => +((s.match(/\+(\d+)/) || [])[1] || 0),
  extractAdvEnhance: s => +((s.match(/상급 재련.*?(\d{1,2})단계/) || [])[1] || 0),
  extractTranscendence: s => {
    const t = utils.stripTags(s);
    const m = t.match(/\[초월\].*?(\d+)\D+(\d+)/);
    return m ? `${m[1]} | ${m[2]}` : "-";
  },
  extractGrade: s => (utils.stripTags(s).match(/(고대|유물)/) || [])[1] || "-",
  extractElixirText: s => {
    const t = utils.stripTags(s);
    const n = t.match(/(.+?)\s*Lv\.\d+/);
    const l = t.match(/Lv\.\d+/);
    return n && l ? `${n[1].trim()} ${l[0]}` : null;
  },
  cleanElixirTag: s => (typeof s === "string" ? s.replace(/^\[[^\]]+\]\s*/, "") : null),
};

async function loadCharacterInformation() {
  const name = document.getElementById("charName").value.trim();
  if (!name) return alert("캐릭터명을 입력하세요.");
  const token = document.getElementById("apikey").value.trim();
  if (!token) return alert("API 키 넣어라");
  toggleBtn("charactherBtn", true);
  try {
    const res = await fetch(
      `https://developer-lostark.game.onstove.com/armories/characters/${name}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      console.error(await res.text());
      return alert("API 호출 실패");
    }
    updateCharacterData(await res.json());
  } catch (e) {
    console.error(e);
  } finally {
    toggleBtn("charactherBtn", false);
  }
}

function updateCharacterData(data) {
  const profile = data.ArmoryProfile;
  const equipmentArr = data.ArmoryEquipment || [];
  const gemsArr = data.ArmoryGem?.Gems || [];
  const engravingArr = data.ArmoryEngraving?.ArkPassiveEffects || [];
  const karmaArr = data.ArkPassive?.Points || [];
  const braceletData = equipmentArr[12];
  const avatarData = data.ArmoryAvatars;
  
  parseJSON(braceletData.Tooltip);

  characterData.info = {
    name: profile.CharacterName,
    class: profile.CharacterClassName,
    level: profile.CharacterLevel,
    itemlevel: profile.ItemMaxLevel,
    expedition: profile.ExpeditionLevel,
  };

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
    "폭밞루 달인",
    "회피의 달인",
  ];
  const stoneMap = { 1: "1 (Lv.6)", 2: "2 (Lv.7)", 3: "3 (Lv.9)", 4: "4 (Lv.10)" };

  equipmentArr.slice(0, 6).forEach((item) => {
    const idx = partOrder[item.Type];
    if (idx == null) return;
    const tip = JSON.parse(item.Tooltip);
    const e0 = tip.Element_000?.value || "";
    const e1 = tip.Element_001?.value || {};
    const e5 = tip.Element_005?.value || "";
    const rawTransc =
      tip.Element_008?.value?.Element_000?.topStr ??
      tip.Element_009?.value?.Element_000?.topStr ??
      "";
    const rawElixers = tip.Element_010?.value?.Element_000?.contentStr || {};
    let lines = Object.values(rawElixers)
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

  engravingArr.forEach((en, i) => {
    if (i < 5) {
      characterData.engravings.names[i] = en.Name;
      characterData.engravings.level[i] = en.Level;
      characterData.engravings.stoneLevel[i] =
        en.AbilityStoneLevel in stoneMap ? stoneMap[en.AbilityStoneLevel] : "-";
    }
  });

  const gemList = gemsArr.map((g, i) => {
    const tip = JSON.parse(g.Tooltip);
    const raw = tip.Element_006?.value?.Element_001 || "";
    const nm = raw.match(/<FONT COLOR='[^']*'>(.*?)<\/FONT>/);
    const skill = nm ? nm[1].trim() : null;
    const type = g.Name.includes("홍염")
      ? "홍염"
      : g.Name.includes("멸화")
      ? "멸화"
      : g.Name.includes("작열")
      ? "작열"
      : g.Name.includes("겁화")
      ? "겁화"
      : null;
    return { skill, level: g.Level, type };
  });

  const typeOrder = { 멸화: 0, 겁화: 1, 작열: 2, 홍염: 3 };
  gemList.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return (typeOrder[a.type] ?? 4) - (typeOrder[b.type] ?? 4);
  });

  characterData.gems.skills = gemList.map((g) => g.skill);
  characterData.gems.levels = gemList.map((g) => g.level);
  characterData.gems.types = gemList.map((g) => g.type);

  const idxMap = characterData.karma.types.reduce((o, t, i) => ({ ...o, [t]: i }), {});
  karmaArr.forEach((p) => {
    if (idxMap[p.Name] != null) characterData.karma.levels[idxMap[p.Name]] = p.Value;
  });

  const rawBrace = JSON.parse(braceletData?.Tooltip || "{}").Element_004?.value?.Element_001 || "";
  console.log(rawBrace);

  // <img> 기준으로 split → 효과 텍스트 추출
  const segments = rawBrace.split(/<img[^>]*>/i);
  segments.shift(); // 첫 segment는 빈 문자열이므로 제거

  const effects = segments
    .map((segment) =>
      segment
        .split(/<br\s*\/?>/i)
        .map(utils.stripTags)
        .map((s) => s.trim())
        .filter((s) => !!s && !s.includes("적용되지 않는다"))
        .join(" ")
    )
    .filter(Boolean)
    .slice(0, 5);

  // 기존 object 유지한 채 key 동적 할당만큼만 유지
  characterData.bracelet = {};
  effects.forEach((effect, i) => {
    characterData.bracelet[`option${i + 1}`] = effect;
  });

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

  drawCharacterData();
}

function drawCharacterData() {
  const t = (id) => document.getElementById(id);
  const mkTbl = (title, hdr, rows) =>
    `<h3>${title}</h3><table><thead><tr>${hdr.map((h) => `<th>${h}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  const infoMap = { name: "이름", class: "클래스", itemlevel: "아이템 레벨", level: "캐릭터 레벨", expedition: "원정대 레벨" };
  const infoRows = Object.entries(characterData.info).map(([k, v]) => [infoMap[k], v]);

  const eqMap = {
    enhance: "강화단계",
    advenhance: "상급재련",
    quality: "품질",
    grade: "등급",
    transcendence: "초월",
    elixir1: "엘릭서 1",
    elixir2: "엘릭서 2",
    avatar: "전압",
  };
  const eqOrder = [5, 0, 1, 2, 3, 4];
  const eqHdr = ["카테고리", ...eqOrder.map((i) => characterData.equipment.parts[i])];
  const eqRows = Object.keys(eqMap).map((k) => [
    eqMap[k],
    ...eqOrder.map((i) => characterData.equipment[k][i]),
  ]);

  const acMap = { option1: "옵션 1", option2: "옵션 2", option3: "옵션 3", stats: "스탯 (힘민지)", quality: "품질" };
  const acHdr = ["카테고리", ...characterData.accessories.parts];
  const acRows = Object.keys(acMap).map((k) => [acMap[k], ...characterData.accessories[k]]);

  const gHdr = ["속성", ...characterData.gems.skills.map((_, i) => `#${i + 1}`)];
  const gRows = [
    ["스킬명", ...characterData.gems.skills],
    ["레벨", ...characterData.gems.levels],
    ["종류", ...characterData.gems.types],
  ];

  const engr = characterData.engravings;
  const engList = engr.names.map((n, i) => {
    const lvl = engr.level[i];
    const rawStone = engr.stoneLevel[i];
    const stoneNum = rawStone && /\d+/.test(rawStone) ? parseInt(rawStone.match(/\d+/)[0]) : 0;
    return { name: n, level: lvl, stoneRaw: rawStone || "-", stoneNum };
  });
  engList.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    if (b.stoneNum !== a.stoneNum) return b.stoneNum - a.stoneNum;
    return a.name.localeCompare(b.name);
  });
  const engHdr = ["각인", ...engList.map((e) => e.name)];
  const engRows = [
    ["레벨", ...engList.map((e) => e.level)],
    ["어빌리티 스톤 활성레벨", ...engList.map((e) => e.stoneRaw)],
  ];

  const brHdr = ["옵션", "값"];
  const brRows = Object.entries(characterData.bracelet).map(([k, v]) => [
    k === "option1"
      ? "특성 1"
      : k === "option2"
      ? "특성 2"
      : k.startsWith("option")
      ? `옵션 ${k.slice(-1)}`
      : k,
    v,
  ]);

  const kaHdr = ["타입", ...characterData.karma.types];
  const kaRows = [["레벨", ...characterData.karma.levels]];

  const html = [];
  html.push(mkTbl("기본 정보", ["속성", ""], infoRows));
  html.push(mkTbl("장비", eqHdr, eqRows));
  html.push(mkTbl("악세서리", acHdr, acRows));
  html.push(mkTbl("보석", gHdr, gRows));
  html.push(mkTbl("각인", engHdr, engRows));
  html.push(mkTbl("팔찌", brHdr, brRows));
  html.push(mkTbl("카르마", kaHdr, kaRows));

  t("characterStats").innerHTML = html.join("<br/>");
}
