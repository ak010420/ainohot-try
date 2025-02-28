const fs = require('fs');

// サービスアカウントのJSONファイルを読み込む
const serviceAccount = JSON.parse(
  fs.readFileSync('./service-account.json', 'utf8')
);

// BASE64エンコード
const encoded = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');

console.log(encoded);