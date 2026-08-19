export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  sourceUrl: string;
  playback:
    | { provider: "netease" }
    | { provider: "kuwo"; musicRid: string };
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "1954465313",
    title: "Fairy",
    artist: "Pam_dinosaur / Reirei",
    sourceUrl: "https://163cn.tv/bdcGlyxm",
    playback: { provider: "netease" },
  },
  {
    id: "1390066400",
    title: "0:00",
    artist: "vezyle",
    sourceUrl: "https://163cn.tv/bdd0vYHa",
    playback: { provider: "kuwo", musicRid: "MUSIC_82839218" },
  },
  {
    id: "1896483239",
    title: "时光重复 我們万劫不复",
    artist: "Seto",
    sourceUrl: "https://163cn.tv/bdd0Ik6Z",
    playback: { provider: "kuwo", musicRid: "MUSIC_530423933" },
  },
  {
    id: "3366392741",
    title: "Losing You",
    artist: "YaKio / Wehti / Trispect",
    sourceUrl: "https://163cn.tv/bdnHtFf1",
    playback: { provider: "netease" },
  },
  {
    id: "3330705324",
    title: "Here With You",
    artist: "Jux",
    sourceUrl: "https://163cn.tv/bdnHB9CI",
    playback: { provider: "netease" },
  },
];
