const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const targetUrl = "https://loatool.taeu.kr/lospi"; // 네가 긁고 싶은 URL
  try {
    const response = await fetch(targetUrl);
    const body = await response.text();
    return {
      statusCode: 200,
      body,
      headers: {
        "Content-Type": "text/html"
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
