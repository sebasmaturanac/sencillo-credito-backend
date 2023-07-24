const OneSignal = require('onesignal-node');

const client = new OneSignal.Client('630e90d8-56ec-45a8-8bf5-ad0297702c12', 'MmI0OGJiNzktNGY0ZS00YmQ2LWJkMTktMDVhMjk0NzQyMjRj');

const sendPushNotification = async ({ title, body, tokens }) => {
  try {
    const notification = {
      headings: {
        en: title,
      },
      contents: {
        en: body,
      },
      // included_segments: ["Subscribed Users"],
      include_player_ids: tokens,
    };
    await client.createNotification(notification);
  } catch (e) {
    console.error(e);
  }
};

module.exports = { sendPushNotification };
