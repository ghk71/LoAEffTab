const characterData = {
  info: { name: null, class: null, engraves: null, itemlevel: 0, level: 0, expedition: 0 },
  equipment: {
    parts: ["머리", "견갑", "상의", "하의", "장갑", "무기"],
    enhance: Array(6).fill(0),
    advenhance: Array(6).fill(0),
    quality: Array(6).fill(0),
    transcendence: Array(6).fill(null),
    grade: Array(6).fill(null),
    elixir1: Array(6).fill(null),
    elixir2: Array(6).fill(null),
    avatar: Array(6).fill(null)
  },
  accessories: {
    parts: ["목걸이", "귀걸이1", "귀걸이2", "반지1", "반지2"],
    option1: Array(5).fill(null),
    option2: Array(5).fill(null),
    option3: Array(5).fill(null),
    stats: Array(5).fill(null),
    quality: Array(5).fill(null),
    grade: Array(5).fill(null),
    tier: Array(5).fill(null)
  },
  gems: { skills: Array(11).fill(null), levels: Array(11).fill(0), types: Array(11).fill(null) },
  engravings: { names: Array(5).fill(null), level: Array(5).fill(0), stoneLevel: Array(5).fill(0) },
  bracelet: { option1: null, option2: null, option3: null, option4: null, option5: null, grade: null, tier: null },
  karma: { types: ["진화", "깨달음", "도약"], levels: [0, 0, 0] }
};

const optionThresholds = {
  목걸이: {
    "추가 피해": [2.60, 1.60],
    "적에게 주는 피해": [2.00, 1.20],
    "세레나데, 신앙, 조화 게이지 획득량": [6.00, 3.60],
    "낙인력": [8.00, 4.80],
    "최대 생명력 +": [6500, 3250],
    "공격력 +": [390, 195],
    "무기공격력 +": [960, 480],
    "최대 마나 +": [30, 15],
    "상태이상 공격 지속시간": [1.00, 0.50],
    "전투 중 생명력 회복량 +": [50, 25]
  },
  귀걸이: {
    "공격력": [1.55, 0.95],
    "무기 공격력": [3.00, 1.80],
    "파티원 회복 효과": [3.50, 2.10],
    "파티원 보호막 효과": [3.50, 2.10],
    "최대 생명력 +": [6500, 3250],
    "공격력 +": [390, 195],
    "무기공격력 +": [960, 480],
    "최대 마나 +": [30, 15],
    "상태이상 공격 지속시간": [1.00, 0.50],
    "전투 중 생명력 회복량 +": [50, 25]
  },
  반지: {
    "치명타 적중률": [1.55, 0.95],
    "치명타 피해": [4.00, 2.40],
    "아군 공격력 강화 효과": [5.00, 3.00],
    "아군 피해량 강화 효과": [7.50, 4.50],
    "최대 생명력 +": [6500, 3250],
    "공격력 +": [390, 195],
    "무기공격력 +": [960, 480],
    "최대 마나 +": [30, 15],
    "상태이상 공격 지속시간": [1.00, 0.50],
    "전투 중 생명력 회복량 +": [50, 25]
  }
};

const mainStatByClass = {
  버서커: "힘", 디스트로이어: "힘", 워로드: "힘", 홀리나이트: "힘", 슬레이어: "힘",
  배틀마스터: "힘", 인파이터: "힘", 기공사: "힘", 창술사: "힘", 스트라이커: "힘", 브레이커: "힘",
  데빌헌터: "민첩", 블래스터: "민첩", 호크아이: "민첩", 스카우터: "민첩", 건슬링어: "민첩",
  데모닉: "민첩", 블레이드: "민첩", 리퍼: "민첩", 소울이터: "민첩",
  아르카나: "지능", 서머너: "지능", 바드: "지능", 소서리스: "지능",
  도화가: "지능", 기상술사: "지능", 환수사: "지능"
};

const optionPriority = {
  목걸이: ["추가 피해", "적에게 주는 피해", "낙인력", "세레나데, 신앙, 조화 게이지 획득량"],
  귀걸이: ["공격력", "무기 공격력", "파티원 회복 효과", "파티원 보호막 효과"],
  반지: ["치명타 적중률", "치명타 피해", "아군 공격력 강화 효과", "아군 피해량 강화 효과"]
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
  extractGrade: s => (utils.stripTags(s).match(/(고대|유물|에스더)/) || [])[1] || "-",
  extractElixirText: s => {
    const t = utils.stripTags(s);
    const n = t.match(/(.+?)\s*Lv\.\d+/);
    const l = t.match(/Lv\.\d+/);
    return n && l ? `${n[1].trim()} ${l[0]}` : null;
  },
  cleanElixirTag: s => (typeof s === "string" ? s.replace(/^\[[^\]]+\]\s*/, "") : null),
};

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

const gradeColors = { 상: "#FFD200", 중: "#B77FFF", 하: "#5FD3F1" };
const colorize = g => `<span style="color:${gradeColors[g]}">${g}</span>`;

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

    const data = await res.json();

    updateCharacter(data);
    updateCharacterEquipment(data.ArmoryEquipment || []);
    updateCharacterAccessary(data.ArmoryEquipment || []);
    updateOtherInformation(data);

    document.getElementById("efficiency-table-wrapper").style.display = "block";

    renderDealShareTable();
  } catch (e) {
    console.error(e);
  } finally {
    toggleBtn("charactherBtn", false);
  }
}

function drawCharacterData () {
  const $ = id => document.getElementById(id);

  /* 헬퍼: 테이블 박스 */
  const box = (title, head, rows) =>
    `<h3>${title}</h3><table><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  /* ── 기본 정보 ── */
  const infoMap  = { name:"이름", class:"클래스", engraves: "작업 각인", itemlevel:"아이템 레벨", level:"캐릭터 레벨", expedition:"원정대 레벨" };
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