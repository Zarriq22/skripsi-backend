const express = require('express');
const router = express.Router();
const { handleChat, getChatHistoryByUser, getAllChat, deleteChatById, deleteChatByUserId } = require('../controllers/chatController');

// POST /api/chat
router.post('/', handleChat);
router.get('/history/:userId', getChatHistoryByUser);
router.get('/', getAllChat);
router.delete('/:id', deleteChatById);
router.delete('/history/:userId', deleteChatByUserId);

module.exports = router;