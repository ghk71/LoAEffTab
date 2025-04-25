const https = require('https');

exports.handler = async function(event, context) {
  const targetUrl = 'https://loatool.taeu.kr/lospi';

  return new Promise((resolve, reject) => {
    https.get(targetUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          body: data,
          headers: {
            'Content-Type': 'text/html',
          }
        });
      });
    }).on('error', (err) => {
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      });
    });
  });
};
