
'use client'

import React, { useState, useEffect } from "react";

export default function HyperDeckPostExplorer({ selectedIp }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [path, setPath] = useState("");
    const [method, setMethod] = useState("POST");
    const [bodyText, setBodyText] = useState("");

    const [result, setResult] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const API_BASE = "";

    // Common POST/PUT endpoints with example bodies
    const actions = [
        {
            label: "Play",
            path: "/transports/0/play",
            method: "POST",
            exampleBody: null,
        },
        {
            label: "Stop",
            path: "/transports/0/stop",
            method: "POST",
            exampleBody: null,
        },
        {
            label: "Record",
            path: "/transports/0/record",
            method: "POST",
            exampleBody: null,
        },
        {
            label: "Clear Timeline 0",
            path: "/timelines/0/clear",
            method: "POST",
            exampleBody: null,
        },
        {
            label: "Set Timeline 0 Clips (example: clip 1)",
            path: "/timelines/0",
            method: "POST",
            exampleBody: { clips: [1] },
        },
        {
            label: "Set Codec Format (DNx HRHQX MXF)",
            path: "/system/codecFormat",
            method: "PUT",
            exampleBody: { codec: "DNx:HRHQX", container: "MXF" },
        },
        {
            label: "Set Input Video Source (SDI)",
            path: "/transports/0/inputVideoSource",
            method: "PUT",
            exampleBody: { inputVideoSource: "SDI" },
        },
        {
            label: "Set Input Video Source (HDMI)",
            path: "/transports/0/inputVideoSource",
            method: "PUT",
            exampleBody: { inputVideoSource: "HDMI" },
        },

        {
            label: "Show Input",
            path: "/transports/0",
            method: "PUT",
            exampleBody: { mode: 'InputPreview' },
        },
    ];

    // initialize from first action
    useEffect(() => {
        const a = actions[0];
        setPath(a.path);
        setMethod(a.method);
        setBodyText(
            a.exampleBody !== null && a.exampleBody !== undefined
                ? JSON.stringify(a.exampleBody, null, 2)
                : ""
        );
    }, []); // run once

    const handleActionChange = (e) => {
        const idx = Number(e.target.value);
        setSelectedIndex(idx);
        const a = actions[idx];
        setPath(a.path);
        setMethod(a.method);
        setResult(null);
        setMessage("");
        setBodyText(
            a.exampleBody !== null && a.exampleBody !== undefined
                ? JSON.stringify(a.exampleBody, null, 2)
                : ""
        );
    };

    const handleSend = async () => {
        setLoading(true);
        setMessage("");
        setResult(null);

        let parsedBody = null;
        if (bodyText.trim().length > 0) {
            try {
                parsedBody = JSON.parse(bodyText);
            } catch (err) {
                setLoading(false);
                setMessage("Body is not valid JSON");
                return;
            }
        }

        try {
            const res = await fetch(`${API_BASE}/api/post-proxy`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-hyperdeck-ip": selectedIp || ""
                },
                body: JSON.stringify({
                    path,
                    method,
                    body: parsedBody,
                }),
            });
            const data = await res.json();
            setResult(data);
            if (!res.ok || !data.ok) {
                setMessage(
                    `Request sent. HyperDeck status: ${data.status ?? res.status}`
                );
            } else {
                setMessage("OK");
            }
        } catch (err) {
            console.error("Error sending POST/PUT:", err);
            setMessage("Error calling backend");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "12px", color: "#e2e8f0" }}>HyperDeck POST / PUT Explorer</h2>

            {/* Action combo */}
            <div style={{ marginBottom: 8 }}>
                <label style={{ color: "#e2e8f0" }}>
                    Action:
                    <select
                        value={selectedIndex}
                        onChange={handleActionChange}
                        style={{ marginLeft: 8, minWidth: 280, background: "#1f2937", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "6px 12px", cursor: "pointer", outline: "none" }}
                    >
                        {actions.map((a, idx) => (
                            <option key={idx} value={idx}>
                                {a.label} ({a.method} {a.path})
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Path + method (editable if you want to experiment) */}
            <div style={{ marginBottom: 8, display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ color: "#e2e8f0" }}>
                    Path:
                    <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        style={{ marginLeft: 8, width: 280, background: "#1f2937", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "6px 12px", outline: "none" }}
                    />
                </label>

                <label style={{ marginLeft: 8, color: "#e2e8f0" }}>
                    Method:
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        style={{ marginLeft: 4, background: "#1f2937", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "6px 12px", cursor: "pointer", outline: "none" }}
                    >
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                    </select>
                </label>

                <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{ marginLeft: 8, background: "#dc2626", color: "#fff", border: "1px solid transparent", borderRadius: 6, padding: "6px 16px", fontWeight: "700", cursor: "pointer" }}
                >
                    {loading ? "Sending…" : "Send"}
                </button>
            </div>

            {/* Request body editor */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, marginBottom: 4, color: "#e2e8f0" }}>Body (JSON, optional):</div>
                <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={6}
                    style={{ width: "100%", fontFamily: "monospace", fontSize: 12, background: "#1f2937", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "8px", outline: "none" }}
                    placeholder='{} or leave empty for no body'
                />
            </div>

            {/* Status */}
            {message && (
                <div style={{ marginBottom: 8, fontSize: 12, color: "#9ca3af" }}>
                    Status: {message}
                </div>
            )}

            {/* Response */}
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
                        <b style={{ color: "#38bdf8" }}>URL:</b> {result.url}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                        <b style={{ color: "#38bdf8" }}>Method:</b> {result.method}
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
                    Select an action and click "Send" to see the response.
                </div>
            )}
        </div>
    );
}
