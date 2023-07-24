const express = require('express');
const router = express.Router();
const awsWorker = require('../controllers/awsController');

router.post('/file', awsWorker.multerInstance("file"), awsWorker.doUpload);
router.delete('/file/:url', awsWorker.removeItem);

module.exports = router;
