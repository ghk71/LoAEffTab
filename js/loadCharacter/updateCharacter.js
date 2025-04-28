const supporterClasses = ["도화가","바드","홀리나이트"];
const engraveMapping = {
  "창술수련":"고독한 기사",  "철옹성":"전투 태세",      "강인한 육체":"광전사의 비기",
  "광기":"광기",            "중력 갑옷":"분노의 망치", "중력 충격":"중력 수련",
  "신성 보호":"축복의 오라", "지치지 않는 힘":"처단자","끝나지 않는 분노":"포식자",
  "기력 회복":"극의: 체술", "속도 강화":"충격 단련",  "강력한 체술":"초심",
  "강력한 오의":"오의",      "세맥타통 I":"세맥타통","역천지체":"역천지체",
  "절제":"절제",            "절정 I":"절정",         "오의난무":"오의난무",
  "일격필살 I":"일격필살",  "권왕파천무":"권왕파천무","수라의 길":"수라의 길",
  "진화의 유산":"진화의 유산","아르데타인의 기술":"아르데타인의 기술",
  "전술 탄환":"전술 탄환",    "핸드 거너":"핸드거너",  "죽음의 습격":"죽음의 습격",
  "두 번째 동료":"두 번째 동료","포격 강화":"포격 강화","화력 강화":"화력 강화",
  "피스메이커 - 핸드건":"피스메이커","사냥의 시간":"사냥의 시간",
  "황후의 은총":"황후의 은총","황제의 칙령":"황제의 칙령","넘치는 교감":"넘치는 교감",
  "상급 소환사":"상급 소환사","점화":"점화","환류":"환류","구원의 선물":"절실한 구원",
  "버스트 강화":"버스트 강화","신속한 일격":"잔재된 기운","멈출 수 없는 충동":"멈출 수 없는 충동",
  "완벽한 억제":"완벽한 억제","피냄새":"갈증","달의 소리":"달의 소리",
  "영혼친화력":"만월의 집행자","그믐의 경계":"그믐의 경계",
  "질풍노도":"질풍노도","이슬비":"이슬비","야성":"야성","환수 각성":"환수 각성","해의 조화":"만개"
};

function updateCharacter(data) {
  const p = data.ArmoryProfile;
  // 클래스명 + 역할 표시
  const role = supporterClasses.includes(p.CharacterClassName) ? "서포터" : "딜러";
  characterData.info.class = `${p.CharacterClassName} (${role})`;
  characterData.info.name = p.CharacterName;
  characterData.info.level = p.CharacterLevel;
  characterData.info.itemlevel = p.ItemMaxLevel;
  characterData.info.expedition = p.ExpeditionLevel;

  // 직업 각인
  const rawEng = JSON.parse(data.ArkPassive.Effects[0].ToolTip).Element_000.value;
  characterData.info.engraves = engraveMapping[rawEng] || rawEng;
}