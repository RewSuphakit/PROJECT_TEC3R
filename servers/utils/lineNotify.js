const line = require('@line/bot-sdk');
require('dotenv').config();
// ตั้งค่า LINE Messaging API
const lineConfig = {
  channelAccessToken:process.env.channelAccessToken , // ใส่ Access Token จาก LINE Developers
  channelSecret: process.env.channelSecret,           
};

const client = new line.Client(lineConfig);

// ฟังก์ชันส่งข้อความ
exports.sendMessage = async (message, imageUrl) => {
  try {
    // Define the payload for text and image messages
    const messages = [
      {
        type: 'text',
        text: message,
      },
    ];

    if (imageUrl) {
      messages.push({
        type: 'image',
        originalContentUrl: imageUrl, 
        previewImageUrl: imageUrl,
      });
    }


    const recipientId = process.env.recipientId; 

    // Send the message using LINE's pushMessage method
    await client.pushMessage(recipientId, messages);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending LINE message:', error);
  }
};
  