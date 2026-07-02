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
const HYPERDECK_IP_1 = process.env.NEXT_PUBLIC_HYPERDECK_IP_1 || process.env.HYPERDECK_IP_1 || "192.168.18.10";
const HYPERDECK_IP_2 = process.env.NEXT_PUBLIC_HYPERDECK_IP_2 || process.env.HYPERDECK_IP_2 || "192.168.18.11";
const HYPERDECK_IP_3 = process.env.NEXT_PUBLIC_HYPERDECK_IP_3 || process.env.HYPERDECK_IP_3 || "192.168.18.12";
const HYPERDECK_IP_4 = process.env.NEXT_PUBLIC_HYPERDECK_IP_4 || process.env.HYPERDECK_IP_4 || "192.168.18.13";

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // 1) WebSocket server for React on same port (3000)
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws", // ws://localhost:3000/ws
  });

  const decks = [
    { id: "deck1", ip: HYPERDECK_IP_1, ws: null, connected: false },
    { id: "deck2", ip: HYPERDECK_IP_2, ws: null, connected: false },
    { id: "deck3", ip: HYPERDECK_IP_3, ws: null, connected: false },
    { id: "deck4", ip: HYPERDECK_IP_4, ws: null, connected: false }
  ];

  wss.on("connection", (ws) => {
    console.log("React client connected to WS /ws");
    // Send current connection status of both decks to the newly connected client
    decks.forEach(deck => {
      ws.send(JSON.stringify({ deck: deck.id, connected: deck.connected }));
    });
  });

  function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  // 2) Connect to HyperDeck WebSockets
  function connectToDeck(deck) {
    const wsUrl = `ws://${deck.ip}/control/api/v1/event/websocket`;
    console.log(`Connecting to HyperDeck ${deck.id} (${deck.ip}) WS...`);
    const ws = new WebSocket(wsUrl);
    deck.ws = ws;

    ws.on("open", () => {
      console.log(`Connected to HyperDeck ${deck.id} (${deck.ip}) WS ✅`);
      deck.connected = true;
      broadcast({ deck: deck.id, connected: true });

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
            "/transports/0/record",
            "/transports/0/timecode",
          ],
        },
      };

      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());

        if (data.data?.property) {
          let out = { deck: deck.id };

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

            case "/transports/0/record":
              out.recording = typeof data.data.value === 'object' ? data.data.value.recording : data.data.value;
              break;

            case "/transports/0/clipIndex":
              out.clipIndex = data.data.value;
              break;

            case "/system/codecFormat":
              out.codecFormat = data.data.value;
              break;

            default:
              return;
          }

          broadcast(out);
        }
      } catch (err) {
        console.error(`Error parsing WS message from HyperDeck ${deck.id}:`, err);
      }
    });

    ws.on("error", (err) => {
      console.error(`HyperDeck ${deck.id} (${deck.ip}) WS error:`, err.message);
      if (deck.connected) {
        deck.connected = false;
        broadcast({ deck: deck.id, connected: false });
      }
    });

    ws.on("close", () => {
      console.log(`HyperDeck ${deck.id} (${deck.ip}) WS closed ❌`);
      if (deck.connected) {
        deck.connected = false;
        broadcast({ deck: deck.id, connected: false });
      }
      setTimeout(() => connectToDeck(deck), 5000);
    });
  }

  // Connect to both decks
  decks.forEach(connectToDeck);

  // let Next handle all HTTP routes and API routes
  server.use((req, res) => handle(req, res));

  const PORT = process.env.PORT || 20000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
