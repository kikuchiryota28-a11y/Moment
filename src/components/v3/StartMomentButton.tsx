"use client";

import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { Button } from "@/components/ui/Button";

export function StartMomentButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function go() {
    setBusy(true);
    const r = await startTodayMoment(id);
    setDone(r.success);
    setBusy(false);
  }

  return (
    <Button
      onClick={() => void go()}
      disabled={busy || done}
      loading={busy}
      fullWidth
      size="lg"
    >
      {done ? "WORLD IS FORMING." : "GO"}
    </Button>
  );
}