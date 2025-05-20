const { Server } = require("socket.io");

let io = null;
let onlineAdmins = new Set();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // sesuaikan dengan frontend
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // Simpan role user (admin/user)
    socket.on("join", (data) => {
      console.log(data)
      socket.userRole = data.role;

      if (data.role === 'admin') {
        onlineAdmins.add(socket.id);
        console.log(`👮 Admin online: ${socket.id}`);
        io.emit("admin_status", true);
      }
    });

    // Handle pesan masuk dari user
    socket.on("chatMessage", (data) => {
      if (onlineAdmins.size > 0) {
        // Kirim ke semua admin
        onlineAdmins.forEach(adminSocketId => {
          io.to(adminSocketId).emit("userMessage", {
            ...data,
            userSocketId: socket.id
          });
        });
      } else {
        // Gak ada admin online? fallback ke chatbot
        io.to(socket.id).emit("chatbotFallback", data.message);
      }
    });

    // Handle pesan dari admin ke user
    socket.on("adminReply", (data) => {
      const { userSocketId, message } = data;
      io.to(userSocketId).emit("adminReply", { message });
    });

    // Admin offline saat disconnect
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      if (socket.userRole === 'admin') {
        onlineAdmins.delete(socket.id);
        console.log("🔴 Admin offline:", socket.id);

        if (onlineAdmins.size === 0) {
          io.emit("admin_status", false);
        }
      }
    });
  });
};

module.exports = { initSocket };