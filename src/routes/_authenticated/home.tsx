import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Initials } from "@/components/AppShell";
import { createPost, deletePost, getFeed, getMyProfile, timeAgo, toggleLike } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "홈 타임라인 — Lumen" },
      { name: "description", content: "팔로우한 사람들과 나의 짧은 글이 시간순으로 쌓이는 Lumen 홈 타임라인." },
      { property: "og:title", content: "홈 타임라인 — Lumen" },
      { property: "og:description", content: "팔로우한 사람들과 나의 짧은 글이 시간순으로 쌓이는 Lumen 홈 타임라인." },
    ],
  }),
  component: Home,
});

function Home() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMyProfile });
  const feedQuery = useQuery({ queryKey: ["feed"], queryFn: getFeed });

  const post = useMutation({
    mutationFn: () => createPost(draft),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const like = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) => toggleLike(id, liked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const me = meQuery.data ?? null;
  const posts = feedQuery.data ?? [];

  return (
    <AppShell me={me}>
      <div className="mb-5 flex items-end justify-between border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">(b) 타임라인</p>
          <h1 className="mt-1 font-serif text-[26px] italic leading-none">홈</h1>
        </div>
        <span className="font-mono text-[11px] text-muted">실시간 · {posts.length}건</span>
      </div>

      <div className="rise mb-5 rounded-2xl border border-border-strong bg-panel p-4">
        <div className="flex gap-3">
          <Initials name={me?.display_name ?? me?.handle ?? "?"} />
          <div className="min-w-0 flex-1">
            <textarea
              rows={2}
              maxLength={300}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && draft.trim()) post.mutate();
              }}
              placeholder="무엇을 생각하고 계신가요?"
              className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted">{draft.length} / 300 · ⌘ + Enter</span>
              <button
                onClick={() => post.mutate()}
                disabled={!draft.trim() || post.isPending}
                className="rounded-md bg-gold px-4 py-1.5 text-sm font-semibold text-background transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                게시
              </button>
            </div>
          </div>
        </div>
      </div>

      {feedQuery.isLoading ? (
        <p className="font-mono text-[11px] text-muted">불러오는 중…</p>
      ) : posts.length === 0 ? (
        <p className="rounded-xl border border-border bg-panel p-6 text-sm text-muted">
          아직 게시물이 없습니다. 첫 문장을 남겨보세요.
        </p>
      ) : (
        <div className="space-y-1">
          {posts.map((p, i) => (
            <article
              key={p.id}
              className="rise group rounded-xl p-3 transition-colors duration-200 hover:bg-panel"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex gap-3">
                <Initials name={p.author?.display_name ?? p.author?.handle ?? "?"} className="mt-0.5 size-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{p.author?.display_name || p.author?.handle}</span>
                    <span className="font-mono text-[11px] text-muted">@{p.author?.handle}</span>
                    <span className="font-mono text-[11px] text-muted">· {timeAgo(p.created_at)}</span>
                    {me && p.author?.id === me.id && (
                      <button
                        onClick={() => remove.mutate(p.id)}
                        className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-destructive"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">{p.content}</p>
                  <div className="mt-2 flex items-center gap-6 text-[13px] text-muted">
                    <button
                      onClick={() => like.mutate({ id: p.id, liked: p.likedByMe })}
                      className={`like-btn transition-colors hover:text-gold ${p.likedByMe ? "text-gold" : ""}`}
                    >
                      <span className="tick inline-block">좋아요 {p.likeCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
