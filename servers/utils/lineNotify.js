const line = require('@line/bot-sdk');

// ตั้งค่า LINE Messaging API
const lineConfig = {
  channelAccessToken: 'Hoeb7kLJkOMTh3DuVCaPvOWCOQJnoLjwSjq4R4V/jaS+v0RqatrNTR2/8FUjUz+etULAVSxP7v6syMmPhBHFISjemC/J4/ezS1zwF1VBAo0eAJ3gWnQT5fjsp79HQFHhJzRPdLk161fQqfHob3eY/wdB04t89/1O/w1cDnyilFU=', // ใส่ Access Token จาก LINE Developers
  channelSecret: 'f760512df0182f77a685b476b80e7afc',           // ใส่ Secret จาก LINE Developers
};

const client = new line.Client(lineConfig);

// ฟังก์ชันส่งข้อความ
exports.sendMessage = async (message) => {
  try {
    const payload = {
      type: 'text',
      text: message,
    };

    // ระบุ userId หรือ groupId ที่ต้องการส่งข้อความ
    const recipientId = 'U378cf98b6a5841d4a8e8ea1b2ff6c32d'; // ใส่ ID ที่ได้จาก Webhook หรือกำหนดเอง

    await client.pushMessage(recipientId, payload);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending LINE message:', error);
  }
};
