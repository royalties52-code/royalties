/** Rewrite legacy WinSweeps/Spinora seed/CMS copy for customer-facing chat. */
export function royaltiesBrandText(value: string): string {
  return value
    .replace(/WinSweeps/gi, "Royalties")
    .replace(/winsweeps/gi, "Royalties")
    .replace(/win sweeps/gi, "Royalties")
    .replace(/Spinora/gi, "Royalties")
    .replace(/spinora/gi, "Royalties");
}

/** @deprecated Use royaltiesBrandText */
export const spinoraBrandText = royaltiesBrandText;
