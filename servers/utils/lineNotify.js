const line = require('@line/bot-sdk');
require('dotenv').config();
// ตั้งค่า LINE Messaging API
const lineConfig = {
  channelAccessToken: process.env.channelAccessToken, // ใส่ Access Token จาก LINE Developers
  channelSecret: process.env.channelSecret,
};

const client = new line.Client(lineConfig);

// ฟังก์ชันส่งข้อความ
exports.sendMessage = async (message, imageUrl) => {
  try {
    // Validate required environment variables
    if (!process.env.channelAccessToken || !process.env.channelSecret) {
      console.warn('LINE Bot SDK: Missing credentials - skipping notification');
      return { success: false, reason: 'Missing credentials' };
    }

    // Define the payload for text and image messages
    const messages = [
      {
        type: 'text',
        text: message,
      },
    ];

    // Validate imageUrl more robustly
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
      console.warn('Invalid imageUrl - skipping image in notification');
      imageUrl = null;
    }

    if (imageUrl && imageUrl !== 'undefined/image_return/') {
      messages.push({
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl,
      });
    }

    // Log the payload before sending
    console.log('LINE Broadcast Payload:', { messages });

    // Send broadcast to all friends of the bot
    await client.broadcast(messages);
    console.log('✓ LINE broadcast sent to all friends');
    return { success: true };
  } catch (error) {
    // Handle different types of errors gracefully
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.warn('LINE API: Network unavailable - notification skipped');
      console.warn('Network Error Details:', error.message);
      return { success: false, reason: 'Network unavailable', error: error.message };
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      console.warn('LINE API: Authentication failed - check credentials');
      return { success: false, reason: 'Authentication failed', error: error.message };
    } else {
      console.warn(`LINE API Error: ${error.message}`);
      return { success: false, reason: 'Unknown error', error: error.message };
    }
    // Don't rethrow - operation continues even if LINE fails
  }
};
