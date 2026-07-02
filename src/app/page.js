'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { HYPERDECK_IP_1, HYPERDECK_IP_2, HYPERDECK_IP_3, HYPERDECK_IP_4 } from "@/lib/hyperdeck";

import AudioRecordFormatControls from './AudioRecordFormatControls'
import HyperDeckInfoPage from "./HyperDeckInfoPage";
import HyperDeckGetExplorer from "./HyperDeckGetExplorer";
import HyperDeckPostExplorer from "./HyperDeckPostExplorer";

export default function HyperDeckController() {
  const [status, setStatus] = useState("Idle");
  const [timecode, setTimecode] = useState("00:00:00:00");
  const [clips, setClips] = useState([]);
  const [currentClip, setCurrentClip] = useState(null);
  const [supportedCodecs, setSupportedCodecs] = useState([]);
  const [selectedCodec, setSelectedCodec] = useState("");
  const [currentCodec, setCurrentCodec] = useState("");

  // IP Selection State (defaults to first IP from .env.local)
  const [selectedIp, setSelectedIp] = useState(HYPERDECK_IP_1);

  // States for WebSocket status updates of all four decks
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

  // Computed properties for the active deck
  const getActiveDeckState = () => {
    if (selectedIp === HYPERDECK_IP_1) {
      return { connected: deck1Connected, timecode: deck1Timecode, status: deck1Status };
    }
    if (selectedIp === HYPERDECK_IP_2) {
      return { connected: deck2Connected, timecode: deck2Timecode, status: deck2Status };
    }
    if (selectedIp === HYPERDECK_IP_3) {
      return { connected: deck3Connected, timecode: deck3Timecode, status: deck3Status };
    }
    if (selectedIp === HYPERDECK_IP_4) {
      return { connected: deck4Connected, timecode: deck4Timecode, status: deck4Status };
    }
    return { connected: false, timecode: "00:00:00:00", status: "Offline" };
  };

  const activeState = getActiveDeckState();
  const activeConnected = activeState.connected;
  const activeTimecode = activeState.timecode;
  const activeStatus = activeState.status;

  // Helper fetch wrapper to attach target IP header
  const fetchWithIp = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "x-hyperdeck-ip": selectedIp
      }
    });
  };

  const loadCodecs = () => {
    fetchWithIp("/api/supported-codecs")
      .then(res => res.json())
      .then(data => {
        console.log("Supported Codecs:", data);
        setSupportedCodecs(data.codecFormats || []);
      })
      .catch(err => console.error("Error loading codecs:", err));
  };

  const getCurrentcodec = async () => {
    try {
      const res = await fetchWithIp("/api/codec");
      const current = await res.json();
      setCurrentCodec(current);
    } catch (err) {
      console.error("Error getting current codec:", err);
    }
  };

  const getClips = () => {
    fetchWithIp("/api/clips")
      .then(res => res.json())
      .then(data => setClips(data.clips || []))
      .catch(err => console.error("Error loading clips:", err));
  };

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => console.log("Connected to backend WS");

    ws.onmessage = (event) => {
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

        // Single deck fallback
        if (data.playing !== undefined) {
          setStatus(data.playing ? "Playing" : "Stopped");
        }
        if (data.timecode) setTimecode(data.timecode);
        if (data.clipIndex !== undefined) setCurrentClip(data.clipIndex);
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    return () => ws.close();
  }, []);

  // Fetch info reactively when selectedIp changes
  useEffect(() => {
    if (selectedIp) {
      getClips();
      loadCodecs();
      getCurrentcodec();
    }
  }, [selectedIp]);

  const getDeckIdFromIp = (ip) => {
    if (ip === HYPERDECK_IP_1) return "deck1";
    if (ip === HYPERDECK_IP_2) return "deck2";
    if (ip === HYPERDECK_IP_3) return "deck3";
    if (ip === HYPERDECK_IP_4) return "deck4";
    return "deck1";
  };

  const sendCommand = (cmd) => {
    const deckId = getDeckIdFromIp(selectedIp);
    fetchWithIp(`/api/${cmd}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deck: deckId })
    });
  };

  const playClip = (clipId) => {
    console.log("Play clip", clipId);
    fetchWithIp("/api/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clipId }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Playing clip:", data))
      .catch((err) => console.error("Error playing clip:", err));
  };

  const setInputSource = (source) => {
    fetchWithIp("/api/input-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source })
    })
      .then(res => res.json())
      .then(data => console.log("Set input source:", data))
      .catch(err => console.error("Error setting input source:", err));
  };

  const cell = { border: "1px solid #374151", padding: "8px", textAlign: "center" };

  const refreshClips = () => {
    getClips();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .btn-action {
          padding: 10px 18px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .btn-action:hover {
          filter: brightness(1.1);
        }
        .btn-action:active {
          transform: scale(0.97);
        }
        .mono-timecode {
          font-family: 'Courier New', Courier, monospace;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 2px;
          padding: 8px 16px;
          background: #020617;
          border-radius: 8px;
          border: 1px solid #1e293b;
          display: inline-block;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
        }
        .dashboard-container {
          background: #0b0f19;
          color: #f8fafc;
          width: 1920px;
          height: 1080px;
          margin: 0 auto;
          padding: 30px;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 460px 1fr 460px;
          gap: 24px;
          flex: 1;
          min-height: 0;
        }
        .column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 0;
          height: 100%;
        }
        .card {
          background: #111827;
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 20px;
          box-sizing: border-box;
        }
        .card-scrollable {
          flex: 1;
          overflow-y: auto;
        }
        .select-ip {
          background: #1f2937;
          color: #f3f4f6;
          border: 1px solid #4b5563;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          outline: none;
          cursor: pointer;
        }
      ` }} />

      <div className="dashboard-container">
        {/* Header and IP selection */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#e2e8f0" }}>
              🎬 BLACKMAGIC DESIGN HYPERDECK CONFIGURATION
            </h1>
            <p style={{ fontSize: "1rem", color: "#64748b", margin: "4px 0 0 0" }}>Status and Advanced Device settings</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* IP Dropdown Selection */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1rem", color: "#9ca3af", fontWeight: "600" }}>Active IP:</span>
              <select
                className="select-ip"
                value={selectedIp}
                onChange={(e) => setSelectedIp(e.target.value)}
              >
                <option value={HYPERDECK_IP_1}>Deck 1: {HYPERDECK_IP_1}</option>
                <option value={HYPERDECK_IP_2}>Deck 2: {HYPERDECK_IP_2}</option>
                <option value={HYPERDECK_IP_3}>Deck 3: {HYPERDECK_IP_3}</option>
                <option value={HYPERDECK_IP_4}>Deck 4: {HYPERDECK_IP_4}</option>
              </select>
            </div>

            {/* Operator Console Link */}
            <Link href="/control" style={{ background: "#dc2626", color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "1rem", boxShadow: "0 4px 10px rgba(220, 38, 38, 0.3)", border: "1px solid transparent", transition: "all 0.2s" }}>
              ⏺ Open Control Console
            </Link>
          </div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="dashboard-grid">
          
          {/* COLUMN 1: CONTROL & ROUTING */}
          <div className="column">
            
            {/* Status card */}
            <div className="card">
              <span style={{ fontSize: "0.75rem", background: "#1e3a8a", color: "#93c5fd", padding: "4px 8px", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Device Status</span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700", margin: "8px 0 0 0" }}>HyperDeck at {selectedIp}</h2>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <div style={{ fontSize: "0.95rem", color: "#9ca3af" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: activeConnected ? "#10b981" : "#ef4444" }}></span>
                    {activeConnected ? "Online" : "Offline"}
                  </span>
                  <span>State: <b>{activeStatus}</b></span>
                </div>
                <div className="mono-timecode" style={{ color: activeStatus === "Recording" ? "#f87171" : activeStatus === "Playing" ? "#34d399" : "#60a5fa" }}>
                  {activeTimecode}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#e2e8f0", fontWeight: "600" }}>Deck Action Triggers</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <button className="btn-action" style={{ background: "#2563eb", color: "#fff", flex: 1 }} onClick={() => sendCommand("play")} disabled={!activeConnected}>▶ Play</button>
                <button className="btn-action" style={{ background: "#4b5563", color: "#fff", flex: 1 }} onClick={() => sendCommand("stop")} disabled={!activeConnected}>⏹ Stop</button>
                <button className="btn-action" style={{ background: "#dc2626", color: "#fff", flex: 1 }} onClick={() => sendCommand("record")} disabled={!activeConnected}>⏺ Record</button>
              </div>
            </div>

            {/* Routing / Formats */}
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "0" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#e2e8f0", fontWeight: "600" }}>Source Routing</h3>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button className="btn-action" style={{ background: "#1e293b", color: "#f3f4f6", border: "1px solid #374151", flex: 1 }} onClick={() => setInputSource("SDI")}>SDI Input</button>
                <button className="btn-action" style={{ background: "#1e293b", color: "#f3f4f6", border: "1px solid #374151", flex: 1 }} onClick={() => setInputSource("HDMI")}>HDMI Input</button>
              </div>
              <button
                className="btn-action"
                style={{ background: "#1e293b", color: "#f3f4f6", border: "1px solid #374151", width: "100%", marginBottom: "20px" }}
                onClick={() => {
                  fetchWithIp("/api/post-proxy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      path: "/transports/0",
                      method: "PUT",
                      body: { mode: "InputPreview" }
                    })
                  })
                    .then(r => r.json())
                    .then(d => console.log("Response:", d))
                    .catch(console.error);
                }}
              >
                Show Input Preview
              </button>

              <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #374151", paddingTop: "16px" }}>
                <AudioRecordFormatControls selectedIp={selectedIp} />
              </div>
            </div>

          </div>

          {/* COLUMN 2: RECORDED CLIPS LIST (SCROLLABLE) */}
          <div className="column">
            <div className="card card-scrollable" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "16px", color: "#e2e8f0" }}>🎬 Recorded Clips Explorer ({clips.length})</h2>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                <button className="btn-action" style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #374151" }} onClick={refreshClips}>Refresh list</button>
                
                <select
                  className="select-ip"
                  style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  value={selectedCodec}
                  onChange={(e) => setSelectedCodec(e.target.value)}
                >
                  <option value="">-- Choose Codec --</option>
                  {supportedCodecs && supportedCodecs.map((val, i) => (
                    <option key={i} value={val.codec + '_' + val.container}>
                      {val.codec + '_' + val.container}
                    </option>
                  ))}
                </select>

                <button 
                  className="btn-action" 
                  style={{ background: "#10b981", color: "#fff" }}
                  onClick={() => {
                    if (!selectedCodec) return;
                    fetchWithIp("/api/codec", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ codec: selectedCodec.split("_")[0], container: selectedCodec.split("_")[1] })
                    });
                  }}
                >
                  Apply Format
                </button>

                <button 
                  className="btn-action"
                  style={{ background: "#1e293b", color: "#fff", border: "1px solid #374151" }}
                  onClick={getCurrentcodec}
                >
                  Query Codec
                </button>

                {currentCodec?.codecFormat && (
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    Active: <b>{currentCodec.codecFormat.codec}_{currentCodec.codecFormat.container}</b>
                  </span>
                )}
              </div>

              {/* Scrollable Table Wrapper */}
              <div style={{ flex: 1, overflowY: "auto", border: "1px solid #374151", borderRadius: "8px" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1f2937", color: "#e2e8f0", position: "sticky", top: 0, zIndex: 1 }}>
                      {["ID", "File Path", "Codec", "Container", "Duration", "Res", "Rate", "Size", "Play"].map(h => (
                        <th key={h} style={{ ...cell, borderBottom: "2px solid #374151", background: "#1f2937", fontSize: "0.9rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clips.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ ...cell, color: "#9ca3af", padding: "30px" }}>No clips detected on deck.</td>
                      </tr>
                    ) : (
                      clips.map((clip) => {
                        const isPlaying = clip.clipUniqueId === currentClip;
                        return (
                          <tr key={clip.clipUniqueId} style={{ backgroundColor: isPlaying ? "rgba(16, 185, 129, 0.15)" : "transparent" }}>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937" }}>{clip.clipUniqueId}</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937", textAlign: "left", fontSize: "0.85rem" }}>{clip.filePath}</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937", fontSize: "0.85rem" }}>{clip.codecFormat?.codec}</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937", fontSize: "0.85rem" }}>{clip.codecFormat?.container}</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937" }}>{clip.durationTimecode}</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937", fontSize: "0.85rem" }}>{clip.videoFormat?.width}x{clip.videoFormat?.height}</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937", fontSize: "0.85rem" }}>{clip.videoFormat?.frameRate ?? "N/A"} fps</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937" }}>{(clip.fileSize ? clip.fileSize / (1024 * 1024) : 0).toFixed(1)}M</td>
                            <td style={{ ...cell, borderBottom: "1px solid #1f2937" }}>
                              <button className="btn-action" style={{ background: "#10b981", color: "#fff", padding: "4px 8px", fontSize: "0.8rem", marginRight: 0 }} onClick={() => playClip(clip.clipUniqueId)}>▶ Play</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLUMN 3: SYSTEM INFO & MAINTAIN PATHS */}
          <div className="column">
            
            {/* System Info card */}
            <div className="card card-scrollable" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <HyperDeckInfoPage selectedIp={selectedIp} />
            </div>

            {/* REST explorers */}
            <div className="card card-scrollable" style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", color: "#e2e8f0", fontWeight: "600" }}>REST Query Explorers</h3>
              <div style={{ flex: 1 }}>
                <HyperDeckGetExplorer selectedIp={selectedIp} />
                <div style={{ height: "20px" }}></div>
                <HyperDeckPostExplorer selectedIp={selectedIp} />
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
