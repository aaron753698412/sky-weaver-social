import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
};

export type FeedPost = {
  id: string;
  content: string;
  created_at: string;
  author: Profile;
  likeCount: number;
  likedByMe: boolean;
};

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, handle, display_name, bio, avatar_url")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFeed(): Promise<FeedPost[]> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id ?? null;

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, created_at, author:profiles!posts_author_id_fkey(id, handle, display_name, bio, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const ids = (posts ?? []).map((p) => p.id);
  if (ids.length === 0) return [];

  const { data: likes, error: likeError } = await supabase
    .from("likes")
    .select("post_id, user_id")
    .in("post_id", ids);
  if (likeError) throw likeError;

  return (posts ?? []).map((p) => {
    const rows = (likes ?? []).filter((l) => l.post_id === p.id);
    return {
      id: p.id,
      content: p.content,
      created_at: p.created_at,
      author: p.author as unknown as Profile,
      likeCount: rows.length,
      likedByMe: me ? rows.some((l) => l.user_id === me) : false,
    };
  });
}

export async function createPost(content: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("로그인이 필요합니다.");
  const { error } = await supabase
    .from("posts")
    .insert({ author_id: auth.user.id, content: content.trim() });
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleLike(postId: string, liked: boolean) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("로그인이 필요합니다.");
  if (liked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", auth.user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: auth.user.id });
    if (error) throw error;
  }
}

export async function updateProfile(input: {
  handle: string;
  display_name: string;
  bio: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("로그인이 필요합니다.");
  const { error } = await supabase
    .from("profiles")
    .update({
      handle: input.handle.trim().toLowerCase(),
      display_name: input.display_name.trim(),
      bio: input.bio.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);
  if (error) throw error;
}

export function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
