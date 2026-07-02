// lib/hyperdeck.js
export const HYPERDECK_IP_1 = process.env.NEXT_PUBLIC_HYPERDECK_IP_1 ?? process.env.HYPERDECK_IP_1 ?? "192.168.18.10";
export const HYPERDECK_IP_2 = process.env.NEXT_PUBLIC_HYPERDECK_IP_2 ?? process.env.HYPERDECK_IP_2 ?? "192.168.18.11";
export const HYPERDECK_IP_3 = process.env.NEXT_PUBLIC_HYPERDECK_IP_3 ?? process.env.HYPERDECK_IP_3 ?? "192.168.18.12";
export const HYPERDECK_IP_4 = process.env.NEXT_PUBLIC_HYPERDECK_IP_4 ?? process.env.HYPERDECK_IP_4 ?? "192.168.18.13";

// Keep for backward compatibility
export const HYPERDECK_IP = HYPERDECK_IP_1;
export const BASE_URL = `http://${HYPERDECK_IP}/control/api/v1`;

export const getBaseUrl = (deckId) => {
  if (deckId === "deck2" || deckId === 2 || deckId === "2" || deckId === HYPERDECK_IP_2) {
    return `http://${HYPERDECK_IP_2}/control/api/v1`;
  }
  if (deckId === "deck3" || deckId === 3 || deckId === "3" || deckId === HYPERDECK_IP_3) {
    return `http://${HYPERDECK_IP_3}/control/api/v1`;
  }
  if (deckId === "deck4" || deckId === 4 || deckId === "4" || deckId === HYPERDECK_IP_4) {
    return `http://${HYPERDECK_IP_4}/control/api/v1`;
  }
  return `http://${HYPERDECK_IP_1}/control/api/v1`;
};


export const getHyperdeckIp = (req) => {
  let ip = req.headers.get("x-hyperdeck-ip");
  if (!ip) {
    const url = new URL(req.url);
    ip = url.searchParams.get("ip");
  }
  if (!ip) {
    ip = HYPERDECK_IP_1;
  }
  return ip;
};

export const resolveUrl = (req, path) => {
  const ip = getHyperdeckIp(req);
  return `http://${ip}/control/api/v1${path}`;
};

