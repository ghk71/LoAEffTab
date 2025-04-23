const palette = {
  yellow : "#FFE94A",  // 품질100·Lv10
  purple : "#D488FF",  // 90~99
  sky    : "#4DDCFF",  // 80~89
  green  : "#3DFF5E",  // 70↓ & 멸화·홍염
  red    : "#BC9E9E",  // 엘릭서 Lv5
  blue   : "#4EBBFF",  // 겁화·작열
  brown  : "#D99C5B"   // 각인 Lv4
};

const wrap = (val, color) => `<span style="color:${color}">${val}</span>`;

const encodeQuality = q => {
  if (q === 100)      return wrap(q, palette.yellow);
  if (q >= 90)        return wrap(q, palette.purple);
  if (q >= 80)        return wrap(q, palette.sky);
  if (q < 80)        return wrap(q, palette.green);
  return q;           // 70~80 구간은 원본 유지
};

/* 엘릭서 Lv.5 → 빨강 */
const encodeElixir = t => t && t.includes("Lv.5") ? wrap(t, palette.red) : (t || "-");

/* 전설 아바타 → 노랑 */
const encodeAvatar = v => v === "전설" ? wrap(v, palette.yellow) : (v || "-");

/* 보석 레벨·종류 인코딩 */
const encodeGemLevel = l => {
  if (l === 10) return wrap(l, palette.yellow);
  if (l === 9)  return wrap(l, palette.purple);
  if (l === 8)  return wrap(l, palette.sky);
  if (l <= 7)   return wrap(l, palette.green);
  return l;
};

const encodeGemType = t => {
  if (t === "멸화" || t === "홍염") return wrap(t, palette.green);
  if (t === "겁화" || t === "작열") return wrap(t, palette.blue);
  return t;
};

/* 각인 */
const encodeEngraveName  = (n, lvl) => lvl === 4 ? wrap(n, palette.brown) : n;
const encodeEngraveLevel = lvl      => lvl === 4 ? wrap(lvl, palette.brown) : lvl;

/* 스톤 */
const encodeStone = s => {
  if (!s || s === "-" || !s.includes("Lv.")) return s;
  if (s.includes("10")) return wrap(s, palette.yellow);
  if (s.includes("9"))  return wrap(s, palette.purple);
  if (s.includes("7"))  return wrap(s, palette.sky);
  if (s.includes("6"))  return wrap(s, palette.green);
  return s;
};

/* 카르마 */
const encodeKarma = k => {
  if (typeof k !== "string") return k;          // 숫자·null 등은 그대로
  const m = k.match(/\((\d)\)/);               // (6) 같은 패턴만 체크
  return m && +m[1] === 6 ? wrap(k, palette.yellow) : k;
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

function updateProfile(profile) {
  characterData.info = {
    name: profile.CharacterName,
    class: profile.CharacterClassName,
    level: profile.CharacterLevel,
    itemlevel: profile.ItemMaxLevel,
    expedition: profile.ExpeditionLevel,
  };
}

function updateEquipment(equipmentArr) {
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
  
    const rawTransc = hasAdvEnhance
      ? tip.Element_009?.value?.Element_000?.topStr ?? ""
      : tip.Element_008?.value?.Element_000?.topStr ?? "";
  
    const elixirSourceA = hasAdvEnhance
      ? tip.Element_010?.value?.Element_000?.contentStr || {}
      : tip.Element_009?.value?.Element_000?.contentStr || {};
  
    const elixirSourceB = hasAdvEnhance
      ? tip.Element_011?.value?.Element_000?.contentStr || {}
      : tip.Element_010?.value?.Element_000?.contentStr || {};
  
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


function updateEngarvings(engravingArr) {
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

function updateAccessary(accData) {
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

function updateCharacterData(data) {
  console.log(data);
  
  const profile = data.ArmoryProfile;
  updateProfile(profile);

  const equipmentArr = data.ArmoryEquipment || [];
  updateEquipment(equipmentArr);
  
  const gemsArr = data.ArmoryGem?.Gems || [];
  updateGems(gemsArr);

  const engravingArr = data.ArmoryEngraving?.ArkPassiveEffects || [];
  updateEngarvings(engravingArr);

  const karmaArr = data.ArkPassive?.Points || [];
  updateKarma(karmaArr);

  const braceletData = equipmentArr[12];
  updateBracelet(braceletData);

  const avatarData = data.ArmoryAvatars;
  updateAvatar(avatarData);

  const accData = data.ArmoryEquipment || [];
  updateAccessary(accData);

  computeKarmaLevels();

  drawCharacterData();
}

function drawCharacterData () {
  const $ = id => document.getElementById(id);

  /* 헬퍼: 테이블 박스 */
  const box = (title, head, rows) =>
    `<h3>${title}</h3><table><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  /* ── 기본 정보 ── */
  const infoMap  = { name:"이름", class:"클래스", itemlevel:"아이템 레벨", level:"캐릭터 레벨", expedition:"원정대 레벨" };
  const infoRows = Object.entries(characterData.info).map(([k,v]) => [infoMap[k], v]);

  /* ── 장비 ── */
  const eqKeyMap = { enhance:"강화단계", advenhance:"상급재련", quality:"품질", grade:"등급",
                     transcendence:"초월", elixir1:"엘릭서 1", elixir2:"엘릭서 2", avatar:"전압" };
  const order    = [5,0,1,2,3,4];             // 무기 먼저
  const eqHead   = ["카테고리", ...order.map(i => characterData.equipment.parts[i])];
  const eqRows   = Object.keys(eqKeyMap).map(key => [
    eqKeyMap[key],
    ...order.map(i => {
      const v = characterData.equipment[key][i];
      if (key === "quality")        return encodeQuality(v);
      if (key === "elixir1" ||
          key === "elixir2")        return encodeElixir(v);
      if (key === "avatar")         return encodeAvatar(v);
      return v;
    })
  ]);

  /* ── 악세서리 ── */
  const acKeyMap = { option1:"옵션 1", option2:"옵션 2", option3:"옵션 3",
                     stats:"스탯 (힘민지)", quality:"품질", grade:"등급", tier:"티어" };
  const acHead   = ["카테고리", ...characterData.accessories.parts];
  const acRows   = Object.keys(acKeyMap).map(key => [
    acKeyMap[key],
    ...characterData.accessories[key].map((v, idx) =>
      key === "quality" ? encodeQuality(v) : v
    )
  ]);

  /* ── 보석 ── */
  const gemCount = 11;

  // 1) header는 무조건 #1~#11
  const gHead = ["속성", ...Array.from({ length: gemCount }, (_, i) => `#${i+1}`)];

  // 2) padding된 배열 만들어 두기
  const skills = [...characterData.gems.skills];
  const levels = [...characterData.gems.levels];
  const types  = [...characterData.gems.types];
  while (skills.length < gemCount) {
    skills.push("-");
    levels.push("-");
    types.push("-");
  }

  // 3) rows는 padding된 배열 사용
  const gRows = [
    ["스킬명", ...skills],
    ["레벨"  , ...levels.map(encodeGemLevel)],
    ["종류"  , ...types .map(encodeGemType )]
  ];

  /* ── 각인 ───────────────────────────────────── */
  const engr = characterData.engravings;

  /* ① 리스트 구성 :   stoneNum = “1 (Lv.6)” 의 맨 앞 1,2,3,4 -------------- */
  const list = engr.names.map((n, i) => {
    const lvl       = engr.level[i];                 // 각인 레벨 (1~4)
    const stoneRaw  = engr.stoneLevel[i] || "-";     // "4 (Lv.10)" 같은 문자열
    const stoneNum  = +(stoneRaw.match(/^(\d+)/)?.[1] || 0); // ← 활성칸 숫자!
    return { name: n, lvl, stoneNum, stoneRaw };
  });

  /* ② 정렬: 1) 각인 레벨 ↓  2) stoneNum ↓  3) 이름 ↑ ------------------------ */
  list.sort((a, b) => {
    if (b.lvl      !== a.lvl)      return b.lvl      - a.lvl;      // 1순위
    if (b.stoneNum !== a.stoneNum) return b.stoneNum - a.stoneNum; // 2순위
    return a.name.localeCompare(b.name);                           // 3순위
  });

  /* ③ 테이블 생성 ---------------------------------------------------------- */
  const engHead = ["각인", ...list.map(e => encodeEngraveName(e.name, e.lvl))];
  const engRows = [
    ["레벨" , ...list.map(e => encodeEngraveLevel(e.lvl    ))],
    ["스톤" , ...list.map(e => encodeStone        (e.stoneRaw))]
  ];

  /* ── 팔찌, 카르마 ── */
  const brHead = ["옵션","값"];
  const brRows = Object.entries(characterData.bracelet)
    .map(([k,v]) => [k.startsWith("option")?`옵션 ${k.slice(-1)}`:k==="grade"?"등급":k==="tier"?"티어":k, v]);

  const kaHead = ["타입", ...characterData.karma.types];
  const kaRows = [["레벨", ...characterData.karma.levels.map(encodeKarma)]];

  /* ── 출력 ── */
  const html = [
    box("기본 정보", ["속성","값"], infoRows),
    box("장비",       eqHead,  eqRows),
    box("악세서리",   acHead,  acRows),
    box("보석",       gHead,   gRows),
    box("각인",       engHead, engRows),
    box("팔찌",       brHead,  brRows),
    box("카르마",     kaHead,  kaRows)
  ];

  $("characterStats").innerHTML = html.join("<br/>");
}


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

const gradeColors = { 상: "#FFD200", 중: "#B77FFF", 하: "#5FD3F1" };
const colorize = g => `<span style="color:${gradeColors[g]}">${g}</span>`;

/* 옵션 등급 붙이던 부분만 교체 */
utils.classifyOption = (part, txt) => {
  const tbl = optionThresholds[part] || {};
  const key = Object.keys(tbl).find(k => txt.includes(k));
  if (!key) return txt;

  const [hi, mid] = tbl[key];
  const val = parseFloat(txt.replace(/[^0-9.+-]/g, ""));
  const grade = val >= hi ? "상" : val >= mid ? "중" : "하";

  /* (상) 를 색깔 span 으로 */
  return `${txt} (${colorize(grade)})`;
};