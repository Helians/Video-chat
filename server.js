const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true
})



// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

// Routes
app.get("/", (request, response) => {
    response.redirect(`/${uuidv4()}`);
});

app.get("/:room", (request, response) => {
    response.render("room", { roomId: request.params.room })
})

io.on('connection', socket => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
    });

    // socket.on('disconnect', () => {
    //     socket.to(roomId).broadcast.emit('user-disconnected', userId)
    //   })
});

// Listener
server.listen(process.env.PORT || 3030);