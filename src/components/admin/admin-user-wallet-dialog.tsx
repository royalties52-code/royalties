"use client";

import { Wallet } from "lucide-react";

import { AdminWalletGrant } from "@/components/admin/admin-wallet-grant";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminUserWalletDialogProps {
  userId: string;
  displayName: string;
  walletBalance: number;
  cashoutWallet: number;
}

export function AdminUserWalletDialog({
  userId,
  displayName,
  walletBalance,
  cashoutWallet,
}: AdminUserWalletDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-xs">
          <Wallet className="size-3.5" aria-hidden />
          Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Load &amp; reset balance</DialogTitle>
          <DialogDescription>
            {displayName} — add funds or reset wallet balances.
          </DialogDescription>
        </DialogHeader>
        <AdminWalletGrant
          userId={userId}
          walletBalance={walletBalance}
          cashoutWallet={cashoutWallet}
        />
      </DialogContent>
    </Dialog>
  );
}
