// Integrare YouTube fără dependențe: predicile vin din feed-ul RSS public (gratuit, fără cotă);
// detecția live folosește videos.list (ieftin, ~1 unitate) doar pe candidații recenți din RSS.
const KEY = process.env.YT_API_KEY;
const CHANNEL_ID = process.env.YT_CHANNEL_ID;

export type Video = { id: string; title: string; published: string; thumb: string; url: string };
export type LiveStatus = { isLive: boolean; videoId?: string; title?: string };

export function hasYoutube(): boolean {
  return !!CHANNEL_ID;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

export async function getLatestVideos(max = 6): Promise<Video[]> {
  if (!CHANNEL_ID) return [];
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const videos: Video[] = [];
    for (const entry of xml.split('<entry>').slice(1)) {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? '';
      if (!id || !title) continue;
      videos.push({
        id,
        title: decodeEntities(title),
        published,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      });
      if (videos.length >= max) break;
    }
    return videos;
  } catch {
    return [];
  }
}

export async function getLiveStatus(): Promise<LiveStatus> {
  if (!KEY || !CHANNEL_ID) return { isLive: false };
  try {
    const recent = await getLatestVideos(5);
    const ids = recent.map((v) => v.id).join(',');
    if (!ids) return { isLive: false };
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${KEY}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { isLive: false };
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const live = (data.items ?? []).find((it: any) => it.snippet?.liveBroadcastContent === 'live');
    return live ? { isLive: true, videoId: live.id, title: live.snippet?.title } : { isLive: false };
  } catch {
    return { isLive: false };
  }
}
