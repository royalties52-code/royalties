import { ProxyAgent } from "undici";

const agents = new Map<string, ProxyAgent>();

function getProxyAgent(proxyUrl: string): ProxyAgent {
  let agent = agents.get(proxyUrl);
  if (!agent) {
    agent = new ProxyAgent(proxyUrl);
    agents.set(proxyUrl, agent);
  }
  return agent;
}

/** Shared WebShare / whitelisted-IP proxy for Layui agent APIs. */
export function resolveGameProxyUrl(...envKeys: string[]): string | undefined {
  for (const key of envKeys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export async function proxyFetch(
  input: string | URL,
  init: RequestInit = {},
  proxyUrl?: string
): Promise<Response> {
  if (!proxyUrl) {
    return fetch(input, init);
  }

  return fetch(input, {
    ...init,
    // Node/undici fetch supports dispatcher for HTTP(S) proxies
    dispatcher: getProxyAgent(proxyUrl),
  } as RequestInit & { dispatcher: ProxyAgent });
}
