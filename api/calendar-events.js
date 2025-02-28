const { google } = require('googleapis');

module.exports = async (req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', 'https://ainohot-try-reservations.powerappsportals.com');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POSTリクエストのみ処理
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // リクエストボディの取得
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // BASE64エンコードされたサービスアカウント情報を復号
    const serviceAccountJson = JSON.parse(
      Buffer.from(process.env.ENCODED_SERVICE_ACCOUNT, 'base64').toString()
    );

    // JWTクライアントを作成
    const jwtClient = new google.auth.JWT(
      serviceAccountJson.client_email,
      null,
      serviceAccountJson.private_key,
      ['https://www.googleapis.com/auth/calendar.readonly']
    );

    // 認証
    await jwtClient.authorize();

    // カレンダーAPIの初期化
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    // イベントを取得
    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID || 'primary',
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime'
    });

    // 結果を返す
    return res.status(200).json({ events: response.data.items });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return res.status(500).json({ error: error.message });
  }
};
