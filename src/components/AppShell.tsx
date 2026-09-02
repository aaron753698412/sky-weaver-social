import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/social";

export function Initials({ name, className = "size-10" }: { name: string; className?: string }) {
  return (
    <div
      className={`${className} shrink-0 grid place-items-center rounded-full border border-border bg-elevated font-serif text-gold-soft`}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}

const navItems = [
  { to: "/home", label: "홈", index: "001" },
  { to: "/profile", label: "프로필", index: "002" },
] as const;

export function AppShell({ me, children }: { me: Profile | null; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center px-4">
          <Link to="/home" className="flex items-baseline gap-2">
            <span className="font-serif text-[22px] italic leading-none">Lumen</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">· Feed</span>
          </Link>
          <nav className="ml-8 hidden items-center gap-1 text-sm md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-muted transition-colors hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-1.5 font-medium text-foreground ring-1 ring-gold/30" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={signOut}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              로그아웃
            </button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-panel py-1 pr-3 pl-1">
              <Initials name={me?.display_name ?? me?.handle ?? "?"} className="size-7 text-sm" />
              <span className="text-sm font-medium">@{me?.handle ?? "..."}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1400px] gap-5 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">(a) 메뉴</p>
            <nav className="space-y-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-muted transition-colors hover:bg-elevated hover:text-foreground"
                  activeProps={{
                    className:
                      "flex items-center justify-between rounded-lg px-3 py-2.5 font-medium text-foreground ring-1 ring-gold/30",
                  }}
                >
                  {item.label}
                  <span className="font-mono text-[10px] text-muted">{item.index}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 rounded-xl border border-border bg-panel p-4">
              <p className="font-serif text-lg italic text-gold-soft">오늘의 한 줄</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                속도가 아니라 조밀함. 이 피드에는 여백이 아니라 문장들이 쌓인다.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>

        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-panel p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">(c) 오늘의 흐름</p>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  ["가독성 설계", "12.4k 게시"],
                  ["나이트모드", "8.1k 게시"],
                  ["타이포그래피", "6.7k 게시"],
                ].map(([topic, count]) => (
                  <li key={topic}>
                    <span className="text-foreground">{topic}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </main>

      <nav className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-around px-4 py-2 text-xs text-muted">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2"
              activeProps={{ className: "px-3 py-2 font-medium text-gold-soft" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
