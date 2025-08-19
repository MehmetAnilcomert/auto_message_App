const express = require('express');
const router = express.Router();
const MessageSender = require('../messageSender');

router.post('/send-birthday-message', async (req, res) => {
  try {
    const { person } = req.body;
    const result = await MessageSender.sendBirthdayMessage(person);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-bulk-birthday-messages', async (req, res) => {
  try {
    const { people, options = {} } = req.body;
    const results = await MessageSender.sendBulkBirthdayMessages(people, options);
    const successCount = results.filter(r => r.result.success).length;

    res.json({
      success: true,
      totalSent: people.length,
      successCount,
      failCount: people.length - successCount,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
