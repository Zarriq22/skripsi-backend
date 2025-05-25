const fetch = require('node-fetch');
const ChatHistory = require('../models/ChatHistory');
const Product = require('../models/Product');
require('dotenv').config();

const handleChat = async (req, res) => {
    const { userId, message, productId } = req.body;
    let productInfo = '';

    // Ambil pesan terakhir dari user
    const lastUserMessage = Array.isArray(message)
        ? message.slice().reverse().find(m => m.role === 'user')?.content || ''
        : '';

    const getFilteredProducts = async (text) => {
        const allProducts = await Product.find();
        const lowerInput = text.toLowerCase();
        const words = lowerInput
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 2);

        return allProducts.filter(product => {
            const productName = product.productName?.toLowerCase() || '';
            const category = product.kategori?.toString().toLowerCase() || '';

            const nameMatch = words.some(word => productName.includes(word));
            const categoryMatch = words.some(word => category.includes(word));

            return nameMatch || categoryMatch;
        });
    };

    // Prioritas 1: Jika user klik dari halaman produk
    if (productId) {
        const product = await Product.findById(productId);
        if (product) {
            productInfo = `\nNama Produk: ${product.productName}\nDeskripsi: ${product.description}\nHarga: Rp${product.price}\nStok: ${product.stock}`;
        }
    }
    // Prioritas 2: Jika user tanya langsung
    else if (lastUserMessage) {
        const relatedProducts = await getFilteredProducts(lastUserMessage);

        // Ambil max 3 produk biar gak overload prompt
        const topProducts = relatedProducts.slice(0, 3);

        if (topProducts.length > 0) {
            productInfo = topProducts.map(p => (
                `\nNama Produk: ${p.productName}\nDeskripsi: ${p.description}\nHarga: Rp${p.price}\nStok: ${p.stock}`
            )).join('\n\n');
        }
    }

    const systemPrompt = {
  role: 'system',
  content: `Kamu adalah chatbot toko fashion online. Jawabanmu HARUS berdasarkan informasi produk yang DIBERIKAN di bawah ini. 
        JANGAN menyebut produk lain yang tidak disebutkan. Jika tidak ada produk yang relevan, cukup beri jawaban sopan seperti "Maaf, kami tidak menemukan produk yang sesuai saat ini."

        Gunakan Bahasa Indonesia. Jangan jawab pertanyaan yang tidak berkaitan dengan fashion.

        Ketentuan toko:
        - Pembayaran hanya saat checkout.
        - Metode pembayaran: BRI, BCA, dan BSI.
        - Produk tidak bisa ditukar setelah checkout.
        - Pengiriman via JNE atau J&T.

        Daftar produk yang tersedia saat ini:
        ${productInfo || "Tidak ada produk yang sesuai."}`
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

        if (!response.ok) {
            const errText = await response.text();
            console.error('DeepSeek API error:', response.status, errText);
            return res.status(500).json({ error: 'DeepSeek API bermasalah.' });
        }

        const data = await response.json();
        const reply = data.choices[0].message;

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