import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — 문장이 쌓이는 소셜 피드" },
      {
        name: "description",
        content: "짧은 글로 생각을 나누는 텍스트 중심 소셜 미디어. 가입하고 나만의 타임라인을 시작하세요.",
      },
      { property: "og:title", content: "Lumen — 문장이 쌓이는 소셜 피드" },
      {
        property: "og:description",
        content: "짧은 글로 생각을 나누는 텍스트 중심 소셜 미디어. 가입하고 나만의 타임라인을 시작하세요.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center px-4">
          <span className="font-serif text-[22px] italic leading-none">Lumen</span>
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">· Feed</span>
          <Link
            to="/auth"
            className="ml-auto rounded-md border border-gold/40 px-3 py-1.5 text-sm font-medium text-gold-soft transition-colors hover:bg-elevated"
          >
            시작하기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">(a) 텍스트 중심 소셜</p>
        <h1 className="mt-4 max-w-2xl font-serif text-5xl italic leading-tight sm:text-6xl">
          문장이 쌓이는 곳,
          <br />
          Lumen
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
          이미지가 아니라 문장으로 이어지는 타임라인. 300자 안에서 오늘의 생각을 적고, 조용히 읽히는
          피드를 만들어보세요.
        </p>
        <Link
          to="/auth"
          className="mt-10 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-background transition-transform duration-200 hover:-translate-y-0.5"
        >
          계정 만들기
        </Link>
      </main>
    </div>
  );
}
