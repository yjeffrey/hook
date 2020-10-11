import https from 'https';
import http from 'http';
import bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';
import express from 'express';
import path from 'path';
bodyParserXml(bodyParser);

const DISCORD_CHANNEL_HOOK = '/api/webhooks/764711424450363422/SB3ySUS8bji0prAZp0eQU6vdMmS4Ag430ZfDhd_fSwidEcUdd-hb750xz4mVOTcd68Pw';
const PUBSUBHUBBUB_YASIN_TOPIC = 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC8Yg5eyPDN-MQArDWO44Pww';
/*
/*
 * Main App
 */
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.xml({
  type: ['*/xml', '+xml'],
}));

app.get('/yasin', async function(request, response) {
  const topic = request.query["hub.topic"];
  if (topic == PUBSUBHUBBUB_YASIN_TOPIC) {
    const message = request.query['hub.challenge'];
    response.status(200).send(message);
  } else {
    response.status(400).send('no');
  }
});

app.post('/yasin', async function(request, response) {
  const message = request.body.feed.entry[0].link[0]['$'].href;
  console.log(JSON.stringify(request.body));
  await postToDiscord(message);
  response.status(200).send("Sent message " + message);
});

app.get('/', async function(request, response) {
  const message = request.query.message;
  await postToDiscord(message);
  response.status(200).send("Sent message " + message);
});

async function postToDiscord(message) {
  const data = JSON.stringify({
    content: message,
  });
  const promise = new Promise((resolve) => {
    const req = https.request(
      {
        host: 'discordapp.com',
        port: 443,
        path: DISCORD_CHANNEL_HOOK,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      }, resolve);

    req.write(data)
    req.end()
  });
  return promise;
}

var server = http.createServer(app);

/*
 * Listen
 */
server.listen(process.env.PORT || 8080);