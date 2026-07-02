'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { HYPERDECK_IP_1, HYPERDECK_IP_2, HYPERDECK_IP_3, HYPERDECK_IP_4 } from "@/lib/hyperdeck";

export default function RecordStopControl() {
  // States for all 4 Hyperdecks
  const [deck1Connected, setDeck1Connected] = useState(false);
  const [deck2Connected, setDeck2Connected] = useState(false);
  const [deck3Connected, setDeck3Connected] = useState(false);
  const [deck4Connected, setDeck4Connected] = useState(false);

  const [deck1Timecode, setDeck1Timecode] = useState("00:00:00:00");
  const [deck2Timecode, setDeck2Timecode] = useState("00:00:00:00");
  const [deck3Timecode, setDeck3Timecode] = useState("00:00:00:00");
  const [deck4Timecode, setDeck4Timecode] = useState("00:00:00:00");

  const [deck1Status, setDeck1Status] = useState("Offline");
  const [deck2Status, setDeck2Status] = useState("Offline");
  const [deck3Status, setDeck3Status] = useState("Offline");
  const [deck4Status, setDeck4Status] = useState("Offline");

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => console.log("Connected to backend WS");

    ws.onmessage = (event) => {
      console.log("WS message received in Control Page:", event.data);
      try {
        const data = JSON.parse(event.data);

        // Update Deck 1 state
        if (data.deck === "deck1") {
          if (data.connected !== undefined) {
            setDeck1Connected(data.connected);
            if (!data.connected) setDeck1Status("Offline");
          }
          if (data.timecode) setDeck1Timecode(data.timecode);
          if (data.recording !== undefined) {
            setDeck1Status(data.recording ? "Recording" : "Stopped");
          } else if (data.playing !== undefined) {
            setDeck1Status(data.playing ? "Playing" : "Stopped");
          } else if (data.stopped !== undefined) {
            setDeck1Status("Stopped");
          }
        }

        // Update Deck 2 state
        if (data.deck === "deck2") {
          if (data.connected !== undefined) {
            setDeck2Connected(data.connected);
            if (!data.connected) setDeck2Status("Offline");
          }
          if (data.timecode) setDeck2Timecode(data.timecode);
          if (data.recording !== undefined) {
            setDeck2Status(data.recording ? "Recording" : "Stopped");
          } else if (data.playing !== undefined) {
            setDeck2Status(data.playing ? "Playing" : "Stopped");
          } else if (data.stopped !== undefined) {
            setDeck2Status("Stopped");
          }
        }

        // Update Deck 3 state
        if (data.deck === "deck3") {
          if (data.connected !== undefined) {
            setDeck3Connected(data.connected);
            if (!data.connected) setDeck3Status("Offline");
          }
          if (data.timecode) setDeck3Timecode(data.timecode);
          if (data.recording !== undefined) {
            setDeck3Status(data.recording ? "Recording" : "Stopped");
          } else if (data.playing !== undefined) {
            setDeck3Status(data.playing ? "Playing" : "Stopped");
          } else if (data.stopped !== undefined) {
            setDeck3Status("Stopped");
          }
        }

        // Update Deck 4 state
        if (data.deck === "deck4") {
          if (data.connected !== undefined) {
            setDeck4Connected(data.connected);
            if (!data.connected) setDeck4Status("Offline");
          }
          if (data.timecode) setDeck4Timecode(data.timecode);
          if (data.recording !== undefined) {
            setDeck4Status(data.recording ? "Recording" : "Stopped");
          } else if (data.playing !== undefined) {
            setDeck4Status(data.playing ? "Playing" : "Stopped");
          } else if (data.stopped !== undefined) {
            setDeck4Status("Stopped");
          }
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    return () => ws.close();
  }, []);

  const sendRecord = (deckId) => {
    fetch("/api/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck: deckId })
    }).catch(err => console.error("Error starting recording:", err));
  };

  const sendStop = (deckId) => {
    fetch("/api/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck: deckId })
    }).catch(err => console.error("Error stopping transport:", err));
  };

  // Gang control check across all four decks
  const allInSync = deck1Status === deck2Status && deck2Status === deck3Status && deck3Status === deck4Status && deck1Status !== "Offline";

  return (
    <div style={{
      background: "#090d16",
      color: "#f8fafc",
      width: "1920px",
      height: "1080px",
      margin: "0 auto",
      padding: "24px 30px",
      boxSizing: "border-box",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes recordPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .btn-record-active {
          animation: recordPulse 1.5s infinite;
          background-color: #dc2626 !important;
          border-color: #ef4444 !important;
        }
        .deck-timecode {
          font-family: 'Courier New', Courier, monospace;
          font-size: 2.8rem;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 8px 16px;
          background: #020617;
          border-radius: 8px;
          border: 1px solid #1e293b;
          display: inline-block;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
        }
        .deck-card {
          background: #111827;
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .deck-card:hover {
          border-color: #4b5563;
        }
        .btn-action {
          padding: 8px 16px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-action:active {
          transform: scale(0.96);
        }
      ` }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#e2e8f0" }}>
            ⏺ HYPERDECK OPERATOR CONSOLE (4-DECK CONSOLE)
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "4px 0 0 0" }}>Quad Deck Record & Stop Control</p>
        </div>
        <Link href="/" style={{ background: "#1e293b", color: "#e2e8f0", textDecoration: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "0.9rem", border: "1px solid #334155", transition: "all 0.2s" }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Master Control Panel (Gang Control) */}
      <div style={{ background: "linear-gradient(to right, #1e1b4b, #0f172a)", border: "1px solid #312e81", borderRadius: "12px", padding: "20px", margin: "16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", background: "#312e81", color: "#c7d2fe", padding: "4px 8px", borderRadius: "4px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Gang Control</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", margin: "6px 0 0 0", color: "#e0e7ff" }}>Synchronized Master Trigger (All Decks)</h2>
          </div>
          <span style={{ fontSize: "1.05rem", color: allInSync ? "#10b981" : "#fbbf24", fontWeight: "700" }}>
            {allInSync ? "✓ Status: In Sync" : "⚠ Status: Out of Sync"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => sendRecord("all")}
            className="btn-action btn-record-active"
            style={{ flex: 1, height: "60px", fontSize: "1.35rem", background: "#dc2626", color: "#fff", cursor: "pointer", boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)" }}
          >
            ⏺ MASTER RECORD ALL
          </button>
          <button
            onClick={() => sendStop("all")}
            className="btn-action"
            style={{ flex: 1, height: "60px", fontSize: "1.35rem", background: "#374151", color: "#f3f4f6", border: "1px solid #4b5563", cursor: "pointer" }}
          >
            ⏹ MASTER STOP ALL
          </button>
        </div>
      </div>

      {/* 2x2 Grid of Decks - Fills remaining height */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "20px", flex: 1, minHeight: "0" }}>

        {/* Deck 1 Card */}
        <div className="deck-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", margin: 0 }}>HyperDeck 1</h3>
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>IP: {HYPERDECK_IP_1}</span>
            </div>
            <span style={{ fontSize: "0.95rem", color: deck1Connected ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: deck1Connected ? "#10b981" : "#ef4444" }}></span>
              {deck1Connected ? "Connected" : "Offline"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
            <div className="deck-timecode" style={{ color: deck1Status === "Recording" ? "#f87171" : deck1Status === "Playing" ? "#34d399" : "#60a5fa" }}>
              {deck1Timecode}
            </div>
            <span style={{ fontSize: "1rem", background: deck1Status === "Recording" ? "rgba(239, 68, 68, 0.15)" : deck1Status === "Playing" ? "rgba(16, 185, 129, 0.15)" : "rgba(75, 85, 99, 0.15)", color: deck1Status === "Recording" ? "#f87171" : deck1Status === "Playing" ? "#34d399" : "#9ca3af", padding: "6px 16px", borderRadius: "100px", fontWeight: "800", border: `1px solid ${deck1Status === "Recording" ? "rgba(239, 68, 68, 0.3)" : deck1Status === "Playing" ? "rgba(16, 185, 129, 0.3)" : "rgba(75, 85, 99, 0.3)"}` }}>
              {deck1Status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => sendRecord("deck1")}
              disabled={!deck1Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: deck1Connected ? "#dc2626" : "#4b5563", color: deck1Connected ? "#fff" : "#9ca3af", cursor: deck1Connected ? "pointer" : "not-allowed" }}
            >
              ⏺ Record
            </button>
            <button
              onClick={() => sendStop("deck1")}
              disabled={!deck1Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: "#1f2937", color: deck1Connected ? "#f3f4f6" : "#9ca3af", border: "1px solid #374151", cursor: deck1Connected ? "pointer" : "not-allowed" }}
            >
              ⏹ Stop
            </button>
          </div>
        </div>

        {/* Deck 2 Card */}
        <div className="deck-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", margin: 0 }}>HyperDeck 2</h3>
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>IP: {HYPERDECK_IP_2}</span>
            </div>
            <span style={{ fontSize: "0.95rem", color: deck2Connected ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: deck2Connected ? "#10b981" : "#ef4444" }}></span>
              {deck2Connected ? "Connected" : "Offline"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
            <div className="deck-timecode" style={{ color: deck2Status === "Recording" ? "#f87171" : deck2Status === "Playing" ? "#34d399" : "#60a5fa" }}>
              {deck2Timecode}
            </div>
            <span style={{ fontSize: "1rem", background: deck2Status === "Recording" ? "rgba(239, 68, 68, 0.15)" : deck2Status === "Playing" ? "rgba(16, 185, 129, 0.15)" : "rgba(75, 85, 99, 0.15)", color: deck2Status === "Recording" ? "#f87171" : deck2Status === "Playing" ? "#34d399" : "#9ca3af", padding: "6px 16px", borderRadius: "100px", fontWeight: "800", border: `1px solid ${deck2Status === "Recording" ? "rgba(239, 68, 68, 0.3)" : deck2Status === "Playing" ? "rgba(16, 185, 129, 0.3)" : "rgba(75, 85, 99, 0.3)"}` }}>
              {deck2Status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => sendRecord("deck2")}
              disabled={!deck2Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: deck2Connected ? "#dc2626" : "#4b5563", color: deck2Connected ? "#fff" : "#9ca3af", cursor: deck2Connected ? "pointer" : "not-allowed" }}
            >
              ⏺ Record
            </button>
            <button
              onClick={() => sendStop("deck2")}
              disabled={!deck2Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: "#1f2937", color: deck2Connected ? "#f3f4f6" : "#9ca3af", border: "1px solid #374151", cursor: deck2Connected ? "pointer" : "not-allowed" }}
            >
              ⏹ Stop
            </button>
          </div>
        </div>

        {/* Deck 3 Card */}
        <div className="deck-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", margin: 0 }}>HyperDeck 3</h3>
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>IP: {HYPERDECK_IP_3}</span>
            </div>
            <span style={{ fontSize: "0.95rem", color: deck3Connected ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: deck3Connected ? "#10b981" : "#ef4444" }}></span>
              {deck3Connected ? "Connected" : "Offline"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
            <div className="deck-timecode" style={{ color: deck3Status === "Recording" ? "#f87171" : deck3Status === "Playing" ? "#34d399" : "#60a5fa" }}>
              {deck3Timecode}
            </div>
            <span style={{ fontSize: "1rem", background: deck3Status === "Recording" ? "rgba(239, 68, 68, 0.15)" : deck3Status === "Playing" ? "rgba(16, 185, 129, 0.15)" : "rgba(75, 85, 99, 0.15)", color: deck3Status === "Recording" ? "#f87171" : deck3Status === "Playing" ? "#34d399" : "#9ca3af", padding: "6px 16px", borderRadius: "100px", fontWeight: "800", border: `1px solid ${deck3Status === "Recording" ? "rgba(239, 68, 68, 0.3)" : deck3Status === "Playing" ? "rgba(16, 185, 129, 0.3)" : "rgba(75, 85, 99, 0.3)"}` }}>
              {deck3Status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => sendRecord("deck3")}
              disabled={!deck3Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: deck3Connected ? "#dc2626" : "#4b5563", color: deck3Connected ? "#fff" : "#9ca3af", cursor: deck3Connected ? "pointer" : "not-allowed" }}
            >
              ⏺ Record
            </button>
            <button
              onClick={() => sendStop("deck3")}
              disabled={!deck3Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: "#1f2937", color: deck3Connected ? "#f3f4f6" : "#9ca3af", border: "1px solid #374151", cursor: deck3Connected ? "pointer" : "not-allowed" }}
            >
              ⏹ Stop
            </button>
          </div>
        </div>

        {/* Deck 4 Card */}
        <div className="deck-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", margin: 0 }}>HyperDeck 4</h3>
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>IP: {HYPERDECK_IP_4}</span>
            </div>
            <span style={{ fontSize: "0.95rem", color: deck4Connected ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: deck4Connected ? "#10b981" : "#ef4444" }}></span>
              {deck4Connected ? "Connected" : "Offline"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" }}>
            <div className="deck-timecode" style={{ color: deck4Status === "Recording" ? "#f87171" : deck4Status === "Playing" ? "#34d399" : "#60a5fa" }}>
              {deck4Timecode}
            </div>
            <span style={{ fontSize: "1rem", background: deck4Status === "Recording" ? "rgba(239, 68, 68, 0.15)" : deck4Status === "Playing" ? "rgba(16, 185, 129, 0.15)" : "rgba(75, 85, 99, 0.15)", color: deck4Status === "Recording" ? "#f87171" : deck4Status === "Playing" ? "#34d399" : "#9ca3af", padding: "6px 16px", borderRadius: "100px", fontWeight: "800", border: `1px solid ${deck4Status === "Recording" ? "rgba(239, 68, 68, 0.3)" : deck4Status === "Playing" ? "rgba(16, 185, 129, 0.3)" : "rgba(75, 85, 99, 0.3)"}` }}>
              {deck4Status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => sendRecord("deck4")}
              disabled={!deck4Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: deck4Connected ? "#dc2626" : "#4b5563", color: deck4Connected ? "#fff" : "#9ca3af", cursor: deck4Connected ? "pointer" : "not-allowed" }}
            >
              ⏺ Record
            </button>
            <button
              onClick={() => sendStop("deck4")}
              disabled={!deck4Connected}
              className="btn-action"
              style={{ flex: 1, height: "48px", fontSize: "1.15rem", background: "#1f2937", color: deck4Connected ? "#f3f4f6" : "#9ca3af", border: "1px solid #374151", cursor: deck4Connected ? "pointer" : "not-allowed" }}
            >
              ⏹ Stop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
