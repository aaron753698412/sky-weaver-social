import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, Initials } from "@/components/AppShell";
import { getMyProfile, updateProfile } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "내 프로필 — Lumen" },
      { name: "description", content: "Lumen에서 사용할 핸들, 표시 이름, 자기소개를 관리합니다." },
      { property: "og:title", content: "내 프로필 — Lumen" },
      { property: "og:description", content: "Lumen에서 사용할 핸들, 표시 이름, 자기소개를 관리합니다." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMyProfile });
  const me = meQuery.data ?? null;

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (me) {
      setHandle(me.handle);
      setDisplayName(me.display_name);
      setBio(me.bio);
    }
  }, [me]);

  const save = useMutation({
    mutationFn: () => updateProfile({ handle, display_name: displayName, bio }),
    onSuccess: () => {
      toast.success("프로필을 저장했습니다.");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell me={me}>
      <div className="mb-5 flex items-end justify-between border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">(b) 계정</p>
          <h1 className="mt-1 font-serif text-[26px] italic leading-none">프로필</h1>
        </div>
      </div>

      <div className="rise rounded-2xl border border-border-strong bg-panel p-5">
        <div className="flex items-center gap-3">
          <Initials name={displayName || handle || "?"} className="size-14 text-xl" />
          <div>
            <p className="text-sm font-semibold">{displayName || handle}</p>
            <p className="font-mono text-[11px] text-muted">@{handle}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="mt-6 space-y-4"
        >
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">핸들</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">표시 이름</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">자기소개</span>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2.5 text-[15px] outline-none transition-shadow focus:border-gold/40 focus:ring-2 focus:ring-gold/25"
            />
          </label>
          <button
            type="submit"
            disabled={save.isPending}
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-background transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {save.isPending ? "저장 중…" : "저장"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
