import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "로그인 · 회원가입 — Lumen" },
      { name: "description", content: "Lumen 계정으로 로그인하거나 새 계정을 만들어 타임라인을 시작하세요." },
      { property: "og:title", content: "로그인 · 회원가입 — Lumen" },
      { property: "og:description", content: "Lumen 계정으로 로그인하거나 새 계정을 만들어 타임라인을 시작하세요." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home", replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { handle: handle.trim().toLowerCase(), display_name: handle.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/home", replace: true });
        } else {
          toast.success("확인 메일을 보냈어요. 메일함에서 링크를 눌러 가입을 완료해주세요.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("비밀번호 재설정 메일을 보냈습니다.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google 로그인에 실패했습니다.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-[22px] italic leading-none">Lumen</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">· Feed</span>
        </Link>

        <div className="rise mt-6 rounded-2xl border border-border-strong bg-panel p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            {mode === "signin" ? "(a) 로그인" : mode === "signup" ? "(b) 회원가입" : "(c) 비밀번호 재설정"}
          </p>
          <h1 className="mt-2 font-serif text-[26px] italic leading-none">
            {mode === "signin" ? "다시 오셨네요" : mode === "signup" ? "계정 만들기" : "비밀번호 찾기"}
          </h1>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">핸들</span>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourhandle"
                  className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
                />
              </label>
            )}

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">이메일</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
              />
            </label>

            {mode !== "forgot" && (
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">비밀번호</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-background transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? "처리 중…" : mode === "signin" ? "로그인" : mode === "signup" ? "가입하기" : "재설정 메일 보내기"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">또는</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <button
                onClick={signInWithGoogle}
                className="w-full rounded-lg border border-border-strong px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-elevated"
              >
                Google로 계속하기
              </button>
            </>
          )}

          <div className="mt-6 flex items-center justify-between text-[13px] text-muted">
            {mode === "signin" ? (
              <>
                <button className="transition-colors hover:text-gold-soft" onClick={() => setMode("signup")}>
                  계정 만들기
                </button>
                <button className="transition-colors hover:text-gold-soft" onClick={() => setMode("forgot")}>
                  비밀번호를 잊으셨나요?
                </button>
              </>
            ) : (
              <button className="transition-colors hover:text-gold-soft" onClick={() => setMode("signin")}>
                ← 로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
