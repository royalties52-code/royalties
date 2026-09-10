import { proxyFetch, resolveGameProxyUrl } from "./proxy-fetch";

/**
 * Gameroom777 Direct REST API Client
 *
 * Same Layui agent API as Mafia / Cash Machine (JSON + Bearer token):
 * 1. Agent Login (POST /api/agent/login)
 * 2. Get player list (GET /api/player/playerList)
 * 3. Add player (POST /api/player/insertPlayer)
 * 4. Get player scores (GET /api/player/getScore)
 * 5. Player recharge (POST /api/player/playerRecharge)
 * 6. Player withdrawal (POST /api/player/playerWithdraw)
 */

export interface GameroomLoginResponse {
  status_code: number;
  message: string;
  data: {
    userName: string;
    money: string;
    token: string;
    expires_time: number;
  };
}

export interface GameroomPlayer {
  Account: string;
  nickname: string;
  AddDate: string;
  LoginCount: number;
  lasttime: string;
  loginip: string;
  account_using: number;
  id: number;
  score: number;
}

export interface GameroomPlayerListResponse {
  status_code: number;
  message: string;
  count: number;
  data: GameroomPlayer[];
}

export interface GameroomAddPlayerResponse {
  status_code: number;
  message: string;
  data: {
    id: number;
    account: string;
    password: string;
    balance: string;
    time: string;
  };
}

export interface GameroomGetScoreResponse {
  status_code: number;
  message: string;
  data: {
    username: string;
    balance: number;
    is_game: boolean;
  };
}

export interface GameroomRechargeResponse {
  status_code: number;
  message: string;
  data: {
    game_id: number;
    username: string;
    balance: number;
    remark: string;
    time: string;
  };
}

export interface GameroomWithdrawResponse {
  status_code: number;
  message: string;
  data: {
    game_id: number;
    username: string;
    balance: number;
    remark: string;
    time: string;
  };
}

export interface GameroomApiConfig {
  baseUrl?: string;
  username?: string;
  password?: string;
  proxyUrl?: string;
}

function gameroomBaseUrl(config?: GameroomApiConfig): string {
  return (
    config?.baseUrl ||
    process.env.GAMEROOM_API_BASE_URL ||
    process.env.GAMEROOM_ADMIN_URL ||
    "https://agentserver1.gameroom777.com/admin/login"
  )
    .replace(/\/admin\/login\/?$/i, "")
    .replace(/\/admin\/?$/i, "")
    .replace(/\/+$/, "");
}

function wrapFetchError(err: unknown, action: string): Error {
  const cause = (err as { cause?: { code?: string } })?.cause;
  const code = cause?.code || "";
  const msg = err instanceof Error ? err.message : String(err);
  if (code === "UND_ERR_SOCKET" || /fetch failed|ECONNRESET|ETIMEDOUT/i.test(msg)) {
    return new Error(
      `Gameroom ${action}: server connection failed. The Gameroom agent host may be blocking this server's IP — contact your distributor to whitelist it (Mafia uses a different host and may work while Gameroom does not).`
    );
  }
  return err instanceof Error ? err : new Error(msg);
}

export class GameroomApiClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private proxyUrl?: string;
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: GameroomApiConfig = {}) {
    this.baseUrl = gameroomBaseUrl(config);
    this.proxyUrl =
      config.proxyUrl ||
      resolveGameProxyUrl("GAMEROOM_PROXY_URL", "GAMEVAULT_PROXY_URL");
    this.username = (
      config.username ||
      process.env.GAMEROOM_AGENT_USERNAME ||
      process.env.GAMEROOM_USERNAME ||
      ""
    ).trim();
    this.password = (
      config.password ||
      process.env.GAMEROOM_AGENT_PASSWORD ||
      process.env.GAMEROOM_PASSWORD ||
      ""
    ).trim();
  }

  public async getValidToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.token && this.tokenExpiresAt > now + 60) {
      return this.token;
    }

    if (!this.username || !this.password) {
      throw new Error("Gameroom agent credentials missing.");
    }

    const loginUrl = `${this.baseUrl}/api/agent/login`;
    let res: Response;
    try {
      res = await proxyFetch(
        loginUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        },
        this.proxyUrl
      );
    } catch (err) {
      throw wrapFetchError(err, "login");
    }

    if (!res.ok) {
      throw new Error(`Gameroom login request failed (${res.status} ${res.statusText})`);
    }

    const json: GameroomLoginResponse = await res.json();
    if (json.status_code !== 200 || !json.data?.token) {
      throw new Error(`Gameroom login authentication failed: ${json.message || "Unknown error"}`);
    }

    this.token = json.data.token;
    this.tokenExpiresAt = json.data.expires_time || now + 3600;
    return this.token;
  }

  public async getPlayerList(page = 1, limit = 50, searchAccount?: string): Promise<GameroomPlayer[]> {
    const token = await this.getValidToken();
    let url = `${this.baseUrl}/api/player/playerList?page=${page}&limit=${limit}`;
    if (searchAccount?.trim()) {
      url += `&account=${encodeURIComponent(searchAccount.trim())}`;
    }

    let res: Response;
    try {
      res = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } }, this.proxyUrl);
    } catch (err) {
      throw wrapFetchError(err, "player list");
    }

    if (!res.ok) {
      throw new Error(`Gameroom getPlayerList HTTP error ${res.status}`);
    }

    const json: GameroomPlayerListResponse = await res.json();
    if (json.status_code !== 200) {
      throw new Error(`Gameroom getPlayerList error: ${json.message}`);
    }

    return json.data || [];
  }

  public async findPlayerByAccount(account: string): Promise<GameroomPlayer | null> {
    const target = account.trim();
    if (!target) return null;
    if (/^\d+$/.test(target)) {
      return { id: Number(target), Account: target } as GameroomPlayer;
    }

    const { getCachedPlayerId, cachePlayerId } = await import("./layui-player-resolve");
    const cached = getCachedPlayerId("gameroom", target);
    if (cached) return { id: Number(cached), Account: target } as GameroomPlayer;

    const players = await this.getPlayerList(1, 10, target);
    const match = players.find(
      (p) =>
        p.Account.trim().toLowerCase() === target.toLowerCase() ||
        p.nickname.trim().toLowerCase() === target.toLowerCase()
    );
    if (match) cachePlayerId("gameroom", target, match.id);
    return match || null;
  }

  public async getPlayerScore(account: string): Promise<number> {
    const player = await this.findPlayerByAccount(account);
    if (!player) {
      throw new Error(`Player ${account} not found on Gameroom agent panel`);
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/api/player/getScore?id=${player.id}`;

    let res: Response;
    try {
      res = await proxyFetch(url, { headers: { Authorization: `Bearer ${token}` } }, this.proxyUrl);
    } catch (err) {
      throw wrapFetchError(err, "balance check");
    }

    if (!res.ok) {
      throw new Error(`Gameroom getPlayerScore HTTP error ${res.status}`);
    }

    const json: GameroomGetScoreResponse = await res.json();
    if (json.status_code !== 200) {
      throw new Error(`Gameroom getPlayerScore error: ${json.message}`);
    }

    return json.data.balance;
  }

  public async createAccount(
    account: string,
    pass: string
  ): Promise<{ id: number; account: string; pass: string }> {
    const token = await this.getValidToken();
    const url = `${this.baseUrl}/api/player/insertPlayer`;

    let res: Response;
    try {
      res = await proxyFetch(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: account,
            password: pass,
          }),
        },
        this.proxyUrl
      );
    } catch (err) {
      throw wrapFetchError(err, "create account");
    }

    if (!res.ok) {
      throw new Error(`Gameroom createAccount HTTP error ${res.status}`);
    }

    const json: GameroomAddPlayerResponse = await res.json();
    if (json.status_code !== 200) {
      throw new Error(`Gameroom createAccount error: ${json.message}`);
    }

    const { cachePlayerId } = await import("./layui-player-resolve");
    if (json.data?.id) cachePlayerId("gameroom", json.data.account || account, json.data.id);

    return {
      id: json.data.id,
      account: json.data.account || account,
      pass: json.data.password || pass,
    };
  }

  public async rechargePlayer(account: string, amount: number): Promise<{ game_id: number; balance: number }> {
    let player = await this.findPlayerByAccount(account);
    if (!player) {
      const created = await this.createAccount(account, "123123");
      player = { id: created.id, Account: created.account } as GameroomPlayer;
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/api/player/playerRecharge`;

    let res: Response;
    try {
      res = await proxyFetch(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: player.id,
            balance: String(amount),
          }),
        },
        this.proxyUrl
      );
    } catch (err) {
      throw wrapFetchError(err, "load");
    }

    if (!res.ok) {
      throw new Error(`Gameroom rechargePlayer HTTP error ${res.status}`);
    }

    const json: GameroomRechargeResponse = await res.json();
    if (json.status_code !== 200) {
      throw new Error(`Gameroom rechargePlayer error: ${json.message}`);
    }

    return {
      game_id: json.data.game_id,
      balance: json.data.balance,
    };
  }

  public async withdrawPlayer(account: string, amount: number): Promise<{ game_id: number; balance: number }> {
    const player = await this.findPlayerByAccount(account);
    if (!player) {
      throw new Error(`Player ${account} not found on Gameroom agent panel`);
    }

    const token = await this.getValidToken();
    const url = `${this.baseUrl}/api/player/playerWithdraw`;

    let res: Response;
    try {
      res = await proxyFetch(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: player.id,
            balance: String(amount),
          }),
        },
        this.proxyUrl
      );
    } catch (err) {
      throw wrapFetchError(err, "redeem");
    }

    if (!res.ok) {
      throw new Error(`Gameroom withdrawPlayer HTTP error ${res.status}`);
    }

    const json: GameroomWithdrawResponse = await res.json();
    if (json.status_code !== 200) {
      throw new Error(`Gameroom withdrawPlayer error: ${json.message}`);
    }

    return {
      game_id: json.data.game_id,
      balance: json.data.balance,
    };
  }
}

export function isGameroomApiConfigured(): boolean {
  const username = process.env.GAMEROOM_AGENT_USERNAME || process.env.GAMEROOM_USERNAME || "";
  const password = process.env.GAMEROOM_AGENT_PASSWORD || process.env.GAMEROOM_PASSWORD || "";
  return Boolean(username.trim() && password.trim());
}

let globalClient: GameroomApiClient | null = null;
export function getGameroomApiClient(config?: GameroomApiConfig): GameroomApiClient {
  if (config || !globalClient) {
    globalClient = new GameroomApiClient(config);
  }
  return globalClient;
}
