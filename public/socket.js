import io from "socket.io-client";
const PORT = process.env.PORT || 8080;
const socket = io();
export default socket;
