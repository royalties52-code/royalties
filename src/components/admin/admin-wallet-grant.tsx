"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminGrantWallet,
  adminDeductWallet,
  adminResetWallet,
} from "@/lib/actions/wallet";
import { walletTypeLabel, type WalletType } from "@/lib/wallet/types";
import { toast } from "sonner";

interface AdminWalletGrantProps {
  userId: string;
  walletBalance?: number;
  cashoutWallet?: number;
}

export function AdminWalletGrant({
  userId,
  walletBalance,
  cashoutWallet,
}: AdminWalletGrantProps) {
  const [amount, setAmount] = useState("5");
  const [walletType, setWalletType] = useState<WalletType>("current");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const label = walletTypeLabel(walletType);
  const parsedAmount = parseFloat(amount);

  async function handleGrant() {
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading("grant");
    const result = await adminGrantWallet(userId, parsedAmount, walletType);
    if (result.error) toast.error(result.error);
    else toast.success(`Added $${parsedAmount} to ${label}`);
    router.refresh();
    setLoading(null);
  }

  async function handleResetByAmount() {
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter how much to reset from the wallet");
      return;
    }
    setLoading("reset");
    const result = await adminDeductWallet(
      userId,
      parsedAmount,
      walletType,
      `Admin reset $${parsedAmount} from ${walletType} wallet`
    );
    if (result.error) toast.error(result.error);
    else toast.success(`Reset $${parsedAmount} from ${label}`);
    router.refresh();
    setLoading(null);
  }

  async function handleClearAll() {
    const ok = window.confirm(`Clear entire ${label} to $0? This removes the full balance.`);
    if (!ok) return;

    setLoading("clear");
    const result = await adminResetWallet(userId, walletType);
    if (result.error) toast.error(result.error);
    else toast.success(`${label} cleared to $0`);
    router.refresh();
    setLoading(null);
  }

  const currentForType =
    walletType === "cashout" ? cashoutWallet : walletBalance;

  return (
    <div className="flex flex-col gap-4">
      {(walletBalance != null || cashoutWallet != null) && (
        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Total deposit
            </dt>
            <dd className="tnum mt-0.5 text-sm font-bold text-ws-gold-deep dark:text-ws-gold">
              ${(walletBalance ?? 0).toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Deposit redeem
            </dt>
            <dd className="tnum mt-0.5 text-sm font-bold text-ws-emerald">
              ${(cashoutWallet ?? 0).toFixed(2)}
            </dd>
          </div>
        </dl>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Wallet
        </label>
        <select
          value={walletType}
          onChange={(e) => setWalletType(e.target.value as WalletType)}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="current">Total Deposit</option>
          <option value="cashout">Deposit Redeem</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Amount
        </label>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-9 text-sm"
          placeholder="e.g. 25.00"
        />
        {currentForType != null && (
          <p className="text-[11px] text-muted-foreground">
            Current {label.toLowerCase()}: ${currentForType.toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="sm"
          className="flex-1"
          onClick={handleGrant}
          disabled={!!loading}
        >
          {loading === "grant" ? "Loading…" : "Load balance"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1"
          onClick={handleClearAll}
          disabled={!!loading}
        >
          {loading === "clear" ? "Resetting…" : "Reset to $0"}
        </Button>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={handleResetByAmount}
        disabled={!!loading}
        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        {loading === "reset"
          ? "Resetting…"
          : parsedAmount > 0
            ? `Reset $${parsedAmount}`
            : "Reset amount"}
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        <strong className="font-medium text-foreground">Load balance</strong> adds funds.
        <strong className="font-medium text-foreground"> Reset to $0</strong> clears the full
        wallet. <strong className="font-medium text-foreground">Reset amount</strong> deducts the
        entered value only.
      </p>
    </div>
  );
}
