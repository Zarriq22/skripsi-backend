const fetch = require('node-fetch');
const ChatHistory = require('../models/ChatHistory');
const Product = require('../models/Product');
const getEmbedding = require('../utils/services/embedding');
const qdrant = require('../utils/services/qdrant');
require('dotenv').config();

// const handleChat = async (req, res) => {
//     const { userId, message, productId } = req.body;
//     let productInfo = '';

//     // Ambil pesan terakhir dari user
//     const lastUserMessage = Array.isArray(message)
//         ? message.slice().reverse().find(m => m.role === 'user')?.content || ''
//         : '';

//     const getFilteredProducts = async (text) => {
//         const allProducts = await Product.find();
//         const lowerInput = text.toLowerCase();
//         const words = lowerInput
//             .replace(/[^\w\s]/gi, '')
//             .split(/\s+/)
//             .filter(w => w.length > 2);

//         return allProducts.filter(product => {
//             const productName = product.productName?.toLowerCase() || '';
//             const category = product.kategori?.toString().toLowerCase() || '';

//             const nameMatch = words.some(word => productName.includes(word));
//             const categoryMatch = words.some(word => category.includes(word));

//             return nameMatch || categoryMatch;
//         });
//     };

//     // Prioritas 1: Jika user klik dari halaman produk
//     if (productId) {
//         const product = await Product.findById(productId);
//         if (product) {
//             productInfo = `\nNama Produk: ${product.productName}\nDeskripsi: ${product.description}\nHarga: Rp${product.price}\nStok: ${product.stock}`;
//         }
//     }
//     // Prioritas 2: Jika user tanya langsung
//     else if (lastUserMessage) {
//         const relatedProducts = await getFilteredProducts(lastUserMessage);

//         // Ambil max 3 produk biar gak overload prompt
//         const topProducts = relatedProducts.slice(0, 3);

//         if (topProducts.length > 0) {
//             productInfo = topProducts.map(p => (
//                 `\nNama Produk: ${p.productName}\nDeskripsi: ${p.description}\nHarga: Rp${p.price}\nStok: ${p.stock}`
//             )).join('\n\n');
//         }
//     }

//     const systemPrompt = {
//     role: 'system',
//     content: `Kamu adalah asisten toko online fashion. Jika ada pertanyaan diluar topik produk atau tidak relevan, tolong jawab dengan sopan. Jawabanmu HARUS berdasarkan informasi produk yang DIBERIKAN di bawah ini. 
//         Jangan menyebutkan produk lain yang tidak disebutkan. Jika tidak ada produk yang relevan, cukup beri jawaban sopan seperti "Maaf, kami tidak menemukan produk yang sesuai saat ini."

//         Gunakan Bahasa Indonesia. Jika ada pertanyaan di luar topik fashion, jawab dengan sopan tanpa menyatakan penolakan eksplisit, dan arahkan kembali ke informasi produk atau layanan kami.

//         Ketentuan toko:
//         - Pembayaran hanya saat checkout.
//         - Metode pembayaran: BRI, BCA, dan BSI.
//         - Produk tidak bisa ditukar setelah checkout.
//         - Pengiriman via JNE atau J&T.
//         - Nomor resi ada dalam fitur "Pesanan Saya"

//         Daftar produk yang tersedia saat ini:
//         ${productInfo || "Tidak ada produk yang sesuai."}`
//     };



//     const messages = [systemPrompt, ...message];

//     try {
//         const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
//             },
//             body: JSON.stringify({
//                 model: 'deepseek/deepseek-r1:free',
//                 messages: messages
//             })
//         });

//         if (!response.ok) {
//             const errText = await response.text();
//             console.error('DeepSeek API error:', response.status, errText);
//             return res.status(500).json({ error: 'DeepSeek API bermasalah.' });
//         }

//         const data = await response.json();
//         const reply = data.choices[0].message;

//         const chatDoc = new ChatHistory({
//             userId,
//             messages: [...message, reply],
//             timestamp: new Date()
//         });
//         await chatDoc.save();

//         res.json({ reply });
//     } catch (err) {
//         console.error('Chat Error:', err);
//         res.status(500).json({ error: 'Terjadi kesalahan saat memproses chat.' });
//     }
// };

const handleChat = async (req, res) => {
    const allProducts = await Product.find();
    const { userId, message, productId } = req.body;

    const kategoriSynonyms = {
        "Pakaian": ['pakaian', 'baju', 'kemeja', 'kaos', 'jaket', 'outfit', 'atasan'],
        "Tas": ['tas', 'backpack', 'ransel', 'handbag', 'pouch'],
        "Sepatu": ['sepatu', 'sneakers', 'boots', 'heels', 'flat shoes', 'kets'],
        "Jam": ['jam', 'jam tangan', 'watch'],
        "Topi": ['topi', 'cap', 'beanie'],
        "Sarung": ['sarung'],
        "Mukena": ['mukena'],
        "Kerudung": ['kerudung', 'hijab', 'jilbab'],
        "Peci": ['peci', 'songkok'],
        "Perhiasan": ['perhiasan', 'cincin', 'kalung', 'gelang', 'anting'],
        "Kacamata": ['kacamata', 'glasses', 'kaca mata'],
        "Aksesoris": ['aksesoris', 'accessories', 'bandana', 'scarf', 'bros']
    };

    const genderSynonyms = {
        'Laki-laki': ['pria', 'cowok', 'laki-laki'],
        'Perempuan': ['wanita', 'cewek', 'perempuan'],
        Unisex: ['unisex', 'semua gender']
    };

    let contextText
    const baseUrl = process.env.WEB_APPLICATION

    try {
        if (productId) {
            // Jika response mendapat productId
            const product = await Product.findById(productId);
            if (product) {
                contextText = `${product.productName} — Rp${product.price} (stok ${product.stock}) — ${product.description} — Link: ${baseUrl}/${product.link}`;
            }
        } else {
            const userQuestion = message[message.length - 1]?.content;
            if (!userQuestion) return res.status(400).json({ error: 'Pertanyaan tidak ditemukan.' });

            // Dapatkan embedding dari pertanyaan user
            const queryVector = await getEmbedding(userQuestion);

            const isNegated = (text, word) => {
                return text.includes(`bukan ${word}`) || 
                text.includes(`tidak ${word}`) || 
                text.includes(`selain ${word}`);
            };

            // Deteksi filter kategori dan gender dari pertanyaan
            const detectFiltersFromText = (text) => {
                text = text.toLowerCase();

                let kategori = null;
                let gender = null;

                // Cek kategori
                for (const [key, synonyms] of Object.entries(kategoriSynonyms)) {
                    if (synonyms.some(word => text.includes(word))) {
                        kategori = key;
                        break;
                    }
                }

                // Cek gender
                for (const [key, synonyms] of Object.entries(genderSynonyms)) {
                    for (const word of synonyms) {
                        if (isNegated(text, word)) {
                            excludeGender = key;
                            break;
                        } else if (text.includes(word)) {
                            gender = key;
                            break;
                        }
                    }
                }

                return { kategori, gender };
            };

            const { gender, kategori } = detectFiltersFromText(userQuestion);

            // Filter Qdrant
            const mustFilter = [];
            if (gender) mustFilter.push({ key: "gender", match: { value: gender }});
            if (kategori) mustFilter.push({ key: "kategori", match: { value: kategori }});

            // Cari produk relevan di Qdrant dengan filter
            const searchResult = await qdrant.search('products', {
                vector: queryVector,
                limit: allProducts.length,
                with_payload: true,
                with_vector: false,
                filter: mustFilter.length ? { must: mustFilter } : undefined
            });

            // Format konteks produk
            contextText = 'Tidak ada produk relevan ditemukan.';
            if (searchResult.length) {
                const contexts = searchResult.map((hit, i) => {
                    const p = hit.payload;
                    return `${i + 1}. ${p.productName} — Rp${p.price} (stok ${p.stock}) — ${p.description} - Link: ${baseUrl}/${p.link}`;
                }).join('\n');
                contextText = `Berikut daftar produk relevan:\n${contexts}`;
            }
        }

        // Format prompt ke DeepSeek
        const messagesWithContext = [
            {
                role: 'system',
                content: `Kamu adalah asisten e-commerce yang menjawab hanya berdasarkan informasi produk berikut:\n${contextText}\n
                    Jawab dengan sopan jika produk tidak tersedia. Balas sapaan dengan sapaan terlebih dahulu, dan itu bukan menanyakan produk. 
                    Pengiriman hanya JNE dan J&T. Pembayaran via BCA, BRI, BSI. Lacak pesanan di menu Pesanan Saya.
                    Jika terdapat link produk, selalu tampilkan dalam format markdown: [Lihat Produk](URL_LINK). 
                    Jika tidak ada produk yang sesuai, balas dengan "Maaf, kami tidak menemukan produk yang sesuai saat ini."`
            },
            ...message
        ];

        // Kirim ke DeepSeek
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1:free',
                messages: messagesWithContext
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('DeepSeek API error:', response.status, errText);
            return res.status(500).json({ error: 'DeepSeek API gagal.' });
        }

        const data = await response.json();
        const reply = data.choices[0].message;

        // 8. Simpan histori chat
        const chatDoc = new ChatHistory({
            userId,
            messages: [...message, reply],
            timestamp: new Date()
        });
        await chatDoc.save();

        res.json({ reply });
    } catch (err) {
        console.error('Chat Error:', err);
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