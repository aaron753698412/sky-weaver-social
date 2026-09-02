import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "새 비밀번호 설정 — Lumen" },
      { name: "description", content: "Lumen 계정의 비밀번호를 새로 설정합니다." },
      { property: "og:title", content: "새 비밀번호 설정 — Lumen" },
      { property: "og:description", content: "Lumen 계정의 비밀번호를 새로 설정합니다." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("두 비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("비밀번호가 변경되었습니다.");
      navigate({ to: "/home", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "변경하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="rise w-full max-w-md rounded-2xl border border-border-strong bg-panel p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">(a) 비밀번호 변경</p>
        <h1 className="mt-2 font-serif text-[26px] italic leading-none">새 비밀번호</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">새 비밀번호</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">확인</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-background transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "저장 중…" : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}
