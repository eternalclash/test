require('dotenv').config();
const { App } = require('@slack/bolt');
const http = require('http');
const app_server =require('express')
const { WebClient } = require('@slack/web-api');
const socket_server = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

function sendDataToClient(data) {
  io.emit('chat', data);
}

const http_server = http.createServer();
const io = require('socket.io')(http_server, {
  perMessageDeflate :false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', async socket => {
  console.log('Client connected');
  socket.on('sendMessage', async ({ channel, text }) => {
    // sendMessageToChannel 함수 호출 시 제공된 채널과 텍스트 사용
    await sendMessageToChannel(channel, text);
  });
  // 채널의 메시지 가져오기
  const channelId = process.env.SOCKET_CHANNEL; // 실제 채널 ID로 대체해야 합니다.
  await fetchChannelHistory(channelId);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
async function sendMessageToChannel(channel, text) {
  try {
    const result = await slackClient.chat.postMessage({
      channel: channel,
      text: text,
    });

    console.log('메시지 전송됨:', result);
  } catch (error) {
    console.error('메시지 전송 중 오류 발생:', error);
  }
}
async function fetchChannelHistory(channelId) {
  let data = [];
  try {
    const response = await socket_server.client.conversations.history({
      channel: channelId,
      limit: 100,
    });
    for (let i = response.messages.length - 1; i >= 0; i--) {
      
      let lines = response.messages[i].text.split('\n');
      const element = {
        title: lines[0],
        content: lines.slice(1),
      };
      data.push(element);
    }
    sendDataToClient(data);
  } catch (error) {
    console.error('Error fetching channel history:', error);
  }
}

// Slack 앱에서 `message.channels` 이벤트 구독
socket_server.event('message', async ({ event, client }) => {
  const channelId = event.channel;
  console.log("신호갔냐")
  await fetchChannelHistory(channelId);
});

(async () => {
  await socket_server.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
  http_server.listen(8080, () => {
    console.log('WebSocket server is running!');
  });
})();
