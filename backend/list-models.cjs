const dotenv = require('dotenv');
dotenv.config();

async function run() {
  let url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY;
  let hasNext = true;
  let pageToken = '';
  const models = [];
  while(hasNext) {
    const fetchUrl = pageToken ? url + '&pageToken=' + pageToken : url;
    const r = await fetch(fetchUrl);
    const data = await r.json();
    if(data.models) {
        models.push(...data.models.map(m => m.name));
    }
    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
    } else {
      hasNext = false;
    }
  }
  console.log(models.filter(m => m.includes('gemini')));
}
run().catch(console.error);
