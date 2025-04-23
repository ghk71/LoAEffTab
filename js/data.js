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