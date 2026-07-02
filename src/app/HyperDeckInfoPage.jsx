'use client'

import React, { useEffect, useState } from "react";

export default function HyperDeckInfoPage({ selectedIp }) {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_BASE = "";

    const loadInfo = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/system-info`, {
                headers: { "x-hyperdeck-ip": selectedIp || "" }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log(data)
            setInfo(data);
        } catch (err) {
            console.error("Error loading system info:", err);
            setError("Failed to load system info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInfo();
    }, [selectedIp]);


    const renderSupportedFormatsTable = () => {
        const vf = info?.supportedVideoFormats?.videoFormats;
        if (!vf || !Array.isArray(vf)) return null;

        return (
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
                <table
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        marginTop: 2,
                        fontSize: 12,
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: "#1f2937" }}>
                            <th style={cell}>Name</th>
                            <th style={cell}>Resolution</th>
                            <th style={cell}>Frame Rate</th>
                            <th style={cell}>Interlaced</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vf.map((fmt, idx) => (
                            <tr key={idx}>
                                <td style={cell}>{fmt.name}</td>
                                <td style={cell}>
                                    {fmt.width} × {fmt.height}
                                </td>
                                <td style={cell}>{fmt.frameRate}</td>
                                <td style={cell}>{fmt.interlaced ? "Yes" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        );
    };

    if (loading && !info) {
        return <div style={{ padding: 16 }}>Loading HyperDeck info…</div>;
    }

    if (error && !info) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{ color: "red" }}>{error}</div>
                <button onClick={loadInfo}>Retry</button>
            </div>
        );
    }

    const cell = {
        border: "1px solid #374151",
        padding: "4px 6px",
        textAlign: "left",
    };

    const product = info?.product || {};
    const systemCodec = info?.codecFormat?.codecFormat || {};
    const activeMedia = info?.mediaActive || {};
    const workingset = info?.mediaWorkingset?.workingset || [];
    const inputVideoSource = info?.inputVideoSource?.inputVideoSource;
    const defaultVF =
        info?.defaultTimelineFormat?.videoFormat ||
        info?.system?.videoFormat?.videoFormat ||
        null;
    const timecode = info?.timecode?.display;

    return (
        <div style={{ padding: 6 }}>
            <div style={{ display: 'flex' }}>
                <div>
                    <h2>HyperDeck System Information</h2>
                </div>

                <div style={{ paddingTop: 25 }}>
                    <button 
                        onClick={loadInfo} 
                        disabled={loading}
                        style={{ background: "#374151", color: "#f3f4f6", border: "1px solid #4b5563", borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                        {loading ? "Refreshing…" : "Refresh"}
                    </button>
                </div>
            </div>



            <div style={{ display: 'flex' }}>
                <div>
                    {/* Device info */}
                    <section style={{ marginTop: 16 }}>
                        <h3>Device</h3>
                        <div>Product: <b>{product.productName}</b></div>
                        <div>Device Name: <b>{product.deviceName}</b></div>
                        <div>Software Version: <b>{product.softwareVersion}</b></div>
                    </section>

                    {/* Codec / input / timecode */}
                    <section style={{ marginTop: 16 }}>
                        <h3>Current Settings</h3>
                        <div>
                            Codec: <b>{systemCodec.codec}</b> ({systemCodec.container})
                        </div>
                        <div>
                            Input Source: <b>{inputVideoSource}</b>
                        </div>
                        <div>
                            Timecode: <b>{timecode}</b>
                        </div>
                        {defaultVF && (
                            <div style={{ marginTop: 4 }}>
                                Default Timeline Format:{" "}
                                <b>
                                    {defaultVF.name} ({defaultVF.width}×{defaultVF.height} @{" "}
                                    {defaultVF.frameRate}
                                    {defaultVF.interlaced ? "i" : "p"})
                                </b>
                            </div>
                        )}
                    </section>
                </div>
                <div>
                    {/* Media info */}
                    <section style={{ marginTop: 16 }}>
                        <h3>Media</h3>
                        <div>Active Device: <b>{activeMedia.deviceName}</b></div>
                        <div>Active Volume: <b>{activeMedia.volume}</b></div>
                        <div>Clip Count: <b>{activeMedia.clipCount}</b></div>

                        {/* Show all workingset slots */}
                        {Array.isArray(workingset) && (
                            <table
                                style={{
                                    borderCollapse: "collapse",
                                    width: "100%",
                                    marginTop: 8,
                                    fontSize: 12,
                                }}
                            >
                                <thead>
                                    <tr style={{ backgroundColor: "#1f2937" }}>
                                        <th style={cell}>Index</th>
                                        <th style={cell}>Device</th>
                                        <th style={cell}>Volume</th>
                                        <th style={cell}>Active</th>
                                        <th style={cell}>Clip Count</th>
                                        <th style={cell}>Remaining Time (s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workingset.map((slot, idx) => {
                                        if (!slot) {
                                            return (
                                                <tr key={idx}>
                                                    <td style={cell}>{idx}</td>
                                                    <td style={cell} colSpan={5}>
                                                        (empty)
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        return (
                                            <tr key={idx}>
                                                <td style={cell}>{slot.index}</td>
                                                <td style={cell}>{slot.deviceName}</td>
                                                <td style={cell}>{slot.volume}</td>
                                                <td style={cell}>{slot.activeDisk ? "Yes" : "No"}</td>
                                                <td style={cell}>{slot.clipCount}</td>
                                                <td style={cell}>{slot.remainingRecordTime}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </section>

                </div>
                <div>

                    {/* Supported video formats */}
                    <section style={{ marginTop: 16 }}>
                        <h3>Supported Video Formats</h3>
                        {renderSupportedFormatsTable()}
                    </section>
                </div>
            </div>

            {error && (
                <div style={{ marginTop: 8, color: "red", fontSize: 12 }}>{error}</div>
            )}




        </div>
    );
}
