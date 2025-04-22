const characterData = {
  info: {
    name: null,
    class: null,
    itemlevel: 0,
    level: 0,
    expedition: 0
  },
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
    skills: ["A", "B", "C", "D", "E", "A", "B", "C", "D", "E", "A"],
    levels: Array(11).fill(0),
    types: Array(11).fill(null),
  },
  engravings: {
    names: Array(5).fill(null),
    level: Array(5).fill(0),
    stoneLevel: Array(5).fill(0),
  },
  bracelet: {
    option1: null,
    option2: null,
    option3: null,
    option4: null,
    option5: null,
  },
  karma: {
    types: ["진화", "깨달음", "도약"],
    levels: [0, 0, 0],
  },
};

function stripTags(str) {
  return str.replace(/<[^>]*>/g, '').trim();
}

function extractNumberFromEnhance(nameTagValue) {
  const match = nameTagValue.match(/\+(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractAdvEnhance(str) {
  const match = str.match(/상급 재련.*?(\d{1,2})단계/);
  return match ? parseInt(match[1]) : 0;
}

function extractTranscendence(topStr) {
  const text = stripTags(topStr);
  const match = text.match(/\[초월\].*?(\d+)\D+(\d+)/);
  return match ? `${match[1]} | ${match[2]}` : null;
}

function extractGrade(str) {
  const gradeMatch = stripTags(str).match(/(고대|유물)/);
  return gradeMatch ? gradeMatch[1] : null;
}

function extractElixirText(str) {
  const noTags = stripTags(str);
  const match = noTags.match(/(.+?)\s*Lv\.\d+/);
  const levelMatch = noTags.match(/Lv\.\d+/);
  return match && levelMatch ? `${match[1].trim()} ${levelMatch[0]}` : null;
}

function cleanElixirTag(str) {
  return str?.replace(/^\[[^\]]+\]\s*/, '') ?? null;
}

function extractElixirs(elixirContent) {
  const list = Object.values(elixirContent || {}).map(e => stripTags(e.contentStr));
  return [list[0] || null, list[1] || null];
}

async function loadCharacterInformation() {
  const name = document.getElementById("charName").value.trim();
  const target = document.getElementById("characterStats");

  if(!name) {
    alert("캐릭터명을 입력하세요.");
    return;
  }

  toggleBtn("charactherBtn",true);
  let infos;
  try {
    const apiToken=document.getElementById("apikey").value.trim();
    if(!apiToken){alert("API 키 넣어라");return;}

    const url='https://developer-lostark.game.onstove.com/armories/characters/' + name;
    const res=await fetch(url,{
      method:'GET',
      headers:{'Content-Type':'application/json','Authorization':`bearer ${apiToken}`},
    });

    if(!res.ok){console.error(await res.text());return alert("재료 API 실패");}
    const data=await res.json();

    console.log(data);
    infos = data;
  } catch(e) {

  } finally {
    toggleBtn("charactherBtn",false);
    updateCharacterData(infos);
  }
}

function updateCharacterData(data) {
  gemsData = data['ArmoryGem']['Gems'];
  engravingData = data['ArmoryEngraving']['ArkPassiveEffects'];
  karmaData = data['ArkPassive']['Points'];
  braceletData = data['ArmoryEquipment'][12];
  equipmentData = data['ArmoryEquipment'];

  characterData.info.class = data['ArmoryProfile']['CharacterClassName'];
  characterData.info.name = data['ArmoryProfile']['CharacterName'];
  characterData.info.itemlevel = data['ArmoryProfile']['ItemMaxLevel'];
  characterData.info.level = data['ArmoryProfile']['CharacterLevel'];
  characterData.info.expedition = data['ArmoryProfile']['ExpeditionLevel'];

  const partOrder = {
    '투구': 0,
    '어깨': 1,
    '상의': 2,
    '하의': 3,
    '장갑': 4,
    '무기': 5
  };
  
  let i=0;
  equipmentData.forEach(item => {
    if (i >= 6) {
      return;
    }

    const tooltip = JSON.parse(item.Tooltip);
    const partName = item.Type;
    const index = partOrder[partName];
    if (index === undefined) return;
  
    const enhance = extractNumberFromEnhance(tooltip?.Element_000?.value || '');
    const advEnhanceRaw = stripTags(tooltip?.Element_005?.value || '');
    const advenhance = extractAdvEnhance(advEnhanceRaw);
    const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;

  
    const elixirGroup = tooltip?.Element_010?.value?.Element_000?.contentStr;
  
    characterData.equipment.enhance[index] = enhance;
    characterData.equipment.advenhance[index] = advenhance;
    characterData.equipment.quality[index] = quality;
    const gradeRaw = tooltip?.Element_001?.value?.leftStr0 || '';
    characterData.equipment.grade[index] = extractGrade(gradeRaw);
    const topStr = tooltip?.Element_009?.value?.Element_000?.topStr || '';
    characterData.equipment.transcendence[index] = extractTranscendence(topStr);
    const elixirs = Object.values(elixirGroup || {}).map(e => extractElixirText(e.contentStr));
    characterData.equipment.elixir1[index] = elixirs[0] || null;
    characterData.equipment.elixir2[index] = elixirs[1] || null;
    characterData.equipment.elixir1 = characterData.equipment.elixir1.map(cleanElixirTag);
    characterData.equipment.elixir2 = characterData.equipment.elixir2.map(cleanElixirTag);

    characterData.equipment.avatar[index] = null;

    i+=1;
  });

  //유각
  engravingData.forEach((engraving, index) => {
    if (index < characterData.engravings.names.length) {
      characterData.engravings.names[index] = engraving.Name;
      characterData.engravings.level[index] = engraving.Level;
      characterData.engravings.stoneLevel[index] = engraving.AbilityStoneLevel ?? 0;
    }
  });

  //보석
  gemsData.forEach((gem, index) => {
    if (index >= characterData.gems.levels.length) return;
  
    // 레벨
    characterData.gems.levels[index] = gem.Level;
  
    // 타입
    if (gem.Name.includes('겁화')) {
      characterData.gems.types[index] = '겁화';
    } else if (gem.Name.includes('작열')) {
      characterData.gems.types[index] = '작열';
    }
  
    // 스킬명 추출
    try {
      const tooltip = JSON.parse(gem.Tooltip);
      const rawSkillHTML = tooltip.Element_006?.value?.Element_001 || '';
      const skillNameMatch = rawSkillHTML.match(/<FONT COLOR='[^']*'>(.*?)<\/FONT>/);
      characterData.gems.skills[index] = skillNameMatch ? skillNameMatch[1].trim() : null;
    } catch (e) {
      characterData.gems.skills[index] = null;
    }
  });

  const gemList = characterData.gems.skills.map((_, i) => ({
    skill: characterData.gems.skills[i],
    level: characterData.gems.levels[i],
    type: characterData.gems.types[i],
  }));
  
  // 겁화 먼저, 나머지 뒤
  gemList.sort((a, b) => {
    if (a.type === '겁화' && b.type !== '겁화') return -1;
    if (a.type !== '겁화' && b.type === '겁화') return 1;
    return 0;
  });
  
  // 다시 나눠서 저장
  characterData.gems.skills = gemList.map(g => g.skill);
  characterData.gems.levels = gemList.map(g => g.level);
  characterData.gems.types = gemList.map(g => g.type);
  

  //카르마
  const typeIndexMap = characterData.karma.types.reduce((acc, type, index) => {
    acc[type] = index;
    return acc;
  }, {});
  
  karmaData.forEach(k => {
    if (typeIndexMap.hasOwnProperty(k.Name)) {
      characterData.karma.levels[typeIndexMap[k.Name]] = k.Value;
    }
  });

  //팔찌
  function stripHtmlTags(str) {
    return str.replace(/<[^>]*>/g, '').trim();
  }
  
  const tooltipObj = JSON.parse(braceletData.Tooltip); // ← 네가 넣은 데이터라고 가정함
  const braceletEffect = tooltipObj?.Element_004?.value?.Element_001 || "";
  
  // <BR> 기준으로 효과 나누기
  const effects = braceletEffect.split(/<BR>/).map(stripHtmlTags).filter(e => e !== '');
  
  // 필요한 5개만 추출
  characterData.bracelet.option1 = effects[0] || null;
  characterData.bracelet.option2 = effects[1] || null;
  characterData.bracelet.option3 = effects[2] || null;
  characterData.bracelet.option4 = effects[3] || null;
  characterData.bracelet.option5 = effects[4] || null;

  console.log(characterData);
  drawCharacterData();
}

function drawCharacterData() {
  const target = document.getElementById("characterStats");

  function makeTable(title, headers, rows) {
    const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<h3>${title}</h3><table>${thead}${tbody}</table>`;
  }

  const html = [];

  // Equipment
  const eq = characterData.equipment;
  const eqKeys = Object.keys(eq).filter(k => k !== "parts");
  const eqRows = eqKeys.map(k => [k, ...eq[k]]);
  html.push(makeTable("Equipment", ["Category", ...eq.parts], eqRows));

  // Accessories
  const acc = characterData.accessories;
  const accRows = Object.keys(acc).filter(k => k !== "parts").map(k => [k, ...acc[k]]);
  html.push(makeTable("Accessories", ["Category", ...acc.parts], accRows));

  // Gems
  const gem = characterData.gems;
  const gemRows = [
    ["Skill", ...gem.skills],
    ["Level", ...gem.levels],
    ["Type", ...gem.types],
  ];
  html.push(makeTable("Gems", ["Property", ...Array.from({ length: gem.skills.length }, (_, i) => `#${i + 1}`)], gemRows));

  // Engravings
  const eng = characterData.engravings;
  const engRows = [
    ["Artifact", ...eng.level],
    ["Stone", ...eng.stoneLevel],
  ];
  html.push(makeTable("Engravings", ["Engraving", ...eng.names], engRows));

  // Bracelet
  const br = characterData.bracelet;
  html.push(makeTable("Bracelet", ["Option", "Value"], [
    ["Crit", br.option1],
    ["Spec", br.option2],
    ["Option1", br.option3],
    ["Option2", br.option4],
    ["Option3", br.option5],
  ]));

  // Misc
  const misc = characterData.karma;
  html.push(makeTable("Etc", ["Type", ...misc.types], [
    ["Level", ...misc.levels]
  ]));

  target.innerHTML = html.join("<br/>");
}
