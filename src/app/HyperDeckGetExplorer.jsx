'use client'

import React, { useState } from "react";

export default function HyperDeckGetExplorer({ selectedIp }) {
    const [selectedPath, setSelectedPath] = useState("/system/product");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const API_BASE = "";

    // List of useful GET endpoints (HyperDeck REST paths)
    const endpoints = [
        { label: "System Product", path: "/system/product" },
        { label: "System Codec Format", path: "/system/codecFormat" },
        { label: "System Supported Video Formats", path: "/system/supportedVideoFormats" },
        { label: "System Video Format (current)", path: "/system/videoFormat" },
        { label: "Timeline 0 (clips)", path: "/timelines/0" },
        { label: "Timeline 0 Default Video Format", path: "/timelines/0/defaultVideoFormat" },
        { label: "Timeline 0 Video Format (current)", path: "/timelines/0/videoFormat" },
        { label: "Media Active", path: "/media/active" },
        { label: "Media Workingset", path: "/media/workingset" },
        { label: "Transports 0 (summary)", path: "/transports/0" },
        { label: "Transport 0 Clip Index", path: "/transports/0/clipIndex" },
        { label: "Transport 0 Input Video Format", path: "/transports/0/inputVideoFormat" },
        { label: "Transport 0 Input Video Source", path: "/transports/0/inputVideoSource" },
        { label: "Transport 0 Timecode", path: "/transports/0/timecode" },
        { label: "Transport 0 Timecode Source", path: "/transports/0/timecode/source" },
        { label: "Clips", path: "/clips" },
    ];

    const handleChange = async (e) => {
        const path = e.target.value;
        setSelectedPath(path);
        await loadPath(path);
    };

    const loadPath = async (path) => {
        setLoading(true);
        setMessage("");
        setResult(null);
        try {
            const res = await fetch(
                `${API_BASE}/api/get-proxy?path=${encodeURIComponent(path)}`,
                { headers: { "x-hyperdeck-ip": selectedIp || "" } }
            );
            const data = await res.json();

            setResult(data);

            if (!res.ok || !data.ok) {
                setMessage(
                    `Request failed. HTTP status from HyperDeck: ${data.status ?? res.status}`
                );
            } else {
                setMessage("OK");
            }
        } catch (err) {
            console.error("Error loading path:", err);
            setMessage("Error calling backend");
        } finally {
            setLoading(false);
        }
    };

    // Optional: button to reload same path
    const handleReload = () => {
        loadPath(selectedPath);
    };

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "12px", color: "#e2e8f0" }}>HyperDeck GET Explorer</h2>

            <div style={{ marginBottom: 8 }}>
                <label style={{ color: "#e2e8f0" }}>
                    Endpoint:
                    <select
                        value={selectedPath}
                        onChange={handleChange}
                        style={{ marginLeft: 8, minWidth: 260, background: "#1f2937", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "6px 12px", cursor: "pointer", outline: "none" }}
                    >
                        {endpoints.map((ep) => (
                            <option key={ep.path} value={ep.path}>
                                {ep.label} ({ep.path})
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    onClick={handleReload}
                    disabled={loading}
                    style={{ marginLeft: 8, background: "#374151", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}
                >
                    {loading ? "Loading…" : "Reload"}
                </button>
            </div>

            {/* Show status / message */}
            {message && (
                <div style={{ marginBottom: 8, fontSize: 12, color: "#9ca3af" }}>
                    Status: {message}
                </div>
            )}

            {/* Show result */}
            {result && (
                <div
                    style={{
                        marginTop: 8,
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        padding: 12,
                        fontFamily: "monospace",
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                        background: "#020617",
                        color: "#e2e8f0",
                    }}
                >
                    <div style={{ marginBottom: 4 }}>
                        <b style={{ color: "#38bdf8" }}>Requested URL:</b> {result.url}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                        <b style={{ color: "#38bdf8" }}>HTTP Status:</b> {result.status} (ok: {String(result.ok)})
                    </div>
                    <div>
                        <b style={{ color: "#38bdf8" }}>Body:</b>
                    </div>
                    <pre style={{ margin: 0, color: "#34d399" }}>
                        {JSON.stringify(result.body, null, 2)}
                    </pre>
                </div>
            )}

            {!result && !loading && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
                    Select an endpoint to see its response.
                </div>
            )}
        </div>
    );
}
