// server.js
const express = require("express");
const next = require("next");
const http = require("http");
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
require("dotenv").config({ path: "./.env.local" });

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// HyperDeck config
const HYPERDECK_IP = process.env.HYPERDECK_IP || "192.168.173.200";
const HYPERDECK_WS_URL = `ws://${HYPERDECK_IP}/control/api/v1/event/websocket`;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // 1) WebSocket server for React on same port (3000)
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws", // ws://localhost:3000/ws
  });

  wss.on("connection", (ws) => {
    console.log("React client connected to WS /ws");
  });

  function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  // 2) Connect to HyperDeck WebSocket
  const hyperdeckWs = new WebSocket(HYPERDECK_WS_URL);

  hyperdeckWs.on("open", () => {
    console.log("Connected to HyperDeck WS ✅");

    const subscribeMsg = {
      type: "request",
      data: {
        action: "subscribe",
        properties: [
          "/media/active",
          "/media/workingset",
          "/system/codecFormat",
          "/system/product",
          "/system/videoFormat",
          "/timelines/0",
          "/transports/0",
          "/transports/0/clipIndex",
          "/transports/0/play",
          "/transports/0/stop",
          "/transports/0/timecode",
        ],
      },
    };

    hyperdeckWs.send(JSON.stringify(subscribeMsg));
  });

  hyperdeckWs.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    if (data.data?.property) {
      let out = {};

      switch (data.data.property) {
        case "/transports/0/timecode":
          out.timecode = data.data.value.display;
          break;

        case "/transports/0/play":
          out.playing = data.data.value;
          break;

        case "/transports/0/stop":
          out.stopped = data.data.value;
          break;

        case "/transports/0/clipIndex":
          out.clipIndex = data.data.value;
          break;

        case "/system/codecFormat":
          out.codecFormat = data.data.value;
          break;

        default:
          // more cases if you want to forward more properties
          return;
      }

      if (Object.keys(out).length > 0) {
        broadcast(out);
      }
    }
  });

  hyperdeckWs.on("error", (err) =>
    console.error("HyperDeck WS error:", err.message)
  );
  hyperdeckWs.on("close", () => console.log("HyperDeck WS closed ❌"));

  // let Next handle all HTTP routes and API routes
server.use((req, res) => handle(req, res));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

});
