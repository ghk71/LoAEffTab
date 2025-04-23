function stripHTML(html) {
  return html.replace(/<[^>]*>/g, '');
}

// 전체 재귀적 HTML 태그 제거
function cleanHTML(obj) {
  if (typeof obj === 'string') {
    return stripHTML(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(cleanHTML);
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = cleanHTML(obj[key]);
    }
    return result;
  }
  return obj;
}

function parseJSON(data) {
  console.log(cleanHTML(data));
  console.log(data);
  try {
    // 1차 파싱 - JSON 문자열로 해석
    const firstDecoded = JSON.parse(`"${data}"`);

    // 2차 파싱 - 실제 객체로
    const parsed = JSON.parse(firstDecoded);

    // HTML 태그 제거
    const cleaned = cleanHTML(parsed);

    output = JSON.stringify(cleaned, null, 2);
  } catch (e) {
    output = "❌ 파싱 실패:\n" + e.message;
  }

  console.log(output);
}