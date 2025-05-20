const fetch = require('node-fetch');
const ChatHistory = require('../models/ChatHistory');
require('dotenv').config();

const handleChat = async (req, res) => {
    const { userId, message } = req.body;

    const systemPrompt = {
        role: "system",
        content: "Kamu adalah chatbot layanan pelanggan untuk toko online. Jawablah dengan sopan, singkat, dan hanya seputar produk, pengiriman, pembayaran, dan kebijakan toko."
    };

    const messages = [systemPrompt, ...message];

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1:free',
                messages: messages
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message;

        // Simpan ke database
        const chatDoc = new ChatHistory({
            userId,
            messages: [...message, reply],
            timestamp: new Date()
        });
        await chatDoc.save();

        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses chat.' });
    }
};

const getChatHistoryByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        let history = await ChatHistory.find({ userId }).sort({ 'messages.timestamp': 1 });

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Kalau belum ada histori sama sekali
        if (!history || history.length === 0) {
            const autoMessage = {
                role: 'assistant',
                content: 'Halo! Ada yang bisa saya bantu hari ini?',
                timestamp: now
            };

            const newChat = new ChatHistory({
                userId,
                messages: [autoMessage]
            });

            await newChat.save();
            return res.json({ history: [newChat] });
        }

        // Ambil dokumen chat terakhir
        const lastChatDoc = history[history.length - 1];
        const lastMessages = lastChatDoc.messages;
        const lastMessageTimestamp = lastMessages[lastMessages.length - 1].timestamp;

        if (lastMessageTimestamp < twentyFourHoursAgo) {
            const autoMessage = {
                role: 'assistant',
                content: 'Halo! Ada yang bisa saya bantu hari ini?',
                timestamp: now
            };

            lastMessages.push(autoMessage);
            await lastChatDoc.save();
        }

        const updatedHistory = await ChatHistory.find({ userId }).sort({ 'messages.timestamp': 1 });

        res.json({ history: updatedHistory });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil histori chat' });
    }
};

const getAllChat = async (req, res) => {
    try {
        const chat = await ChatHistory.find();
        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil histori chat' });
    }
};

const deleteChatById = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await ChatHistory.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Chat tidak ditemukan' });
        }
        res.json({ message: 'Chat berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus chat', error });
    }
};

const deleteChatByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const deleted = await ChatHistory.deleteMany({ userId });
        if (!deleted) {
            return res.status(404).json({ message: 'Chat tidak ditemukan' });
        }
        res.json({ message: 'Chat berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus chat', error });
    }
};

module.exports = {
    handleChat,
    getChatHistoryByUser,
    getAllChat,
    deleteChatById,
    deleteChatByUserId
};