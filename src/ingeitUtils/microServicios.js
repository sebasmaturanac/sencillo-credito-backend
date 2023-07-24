const axios = require('axios');

const sendMail = async (params) => {
  const url = 'http://localhost:6245/api/email/send';
  const response = await axios.post(url, params);
  return response;
};

const sendNotification = async (params) => {
  const url = 'http://localhost:7874/api/pushNotification';
  const response = await axios.post(url, params);
  return response;
};

module.exports = { sendMail, sendNotification };
