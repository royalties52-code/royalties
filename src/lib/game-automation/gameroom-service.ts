import { createAdminClient } from "@/lib/supabase/admin";
import { formatGameAutomationError } from "./error-formatter";
import { GameroomApiClient, isGameroomApiConfigured } from "./gameroom-api";

export { isGameroomApiConfigured };

export async function autoFulfillGameroomRequest(
  requestId: string,
  loadType: "create_account" | "new_account" | "check_balance" | "load" | "reload" | "redeem",
  input: {
    userId: string;
    gameUsername?: string | null;
    amount?: number | null;
    requestedUsername?: string | null;
    requestedPassword?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isGameroomApiConfigured()) {
    return { success: false, error: "Gameroom API credentials not configured." };
  }

  const admin = createAdminClient();
  if (!admin) return { success: false, error: "Database admin client unavailable." };

  try {
    const client = new GameroomApiClient();

    if (loadType === "create_account" || loadType === "new_account") {
      const username = input.requestedUsername || `GR${Math.floor(100000 + Math.random() * 900000)}`;
      const password = input.requestedPassword || "123123";
      const created = await client.createAccount(username, password);

      await admin
        .from("game_load_requests")
        .update({
          status: "completed",
          game_username: created.account,
          game_password: created.pass,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return { success: true };
    }

    if (loadType === "check_balance") {
      const username = input.gameUsername?.trim();
      if (!username) throw new Error("Game username missing");

      const balance = await client.getPlayerScore(username);

      await admin
        .from("game_load_requests")
        .update({
          status: "completed",
          amount: balance,
          admin_notes: `Balance: $${balance.toFixed(2)}`,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return { success: true };
    }

    if (loadType === "load" || loadType === "reload") {
      const username = input.gameUsername?.trim();
      const amount = input.amount || 0;
      if (!username) throw new Error("Game username missing");

      await client.rechargePlayer(username, amount);

      await admin
        .from("game_load_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return { success: true };
    }

    if (loadType === "redeem") {
      const username = input.gameUsername?.trim();
      const amount = input.amount || 0;
      if (!username) throw new Error("Game username missing");

      await client.withdrawPlayer(username, amount);

      await admin
        .from("game_load_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return { success: true };
    }

    return { success: false, error: `Unknown load type: ${loadType}` };
  } catch (err: unknown) {
    const userError = formatGameAutomationError(err, input.amount);

    if (loadType === "load" || loadType === "reload") {
      try {
        await admin.rpc("refund_game_load_wallet", { p_request_id: requestId });
      } catch {}
    }

    await admin
      .from("game_load_requests")
      .update({
        status: "failed",
        error_message: userError,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    return { success: false, error: userError };
  }
}
