import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faForwardStep,
  faHeart as faHeartSolid,
  faPause,
  faPlay,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

import type { MusicTrack } from "../../data/music";
import "../../styles/music-player.stylus";

type Props = {
  imageUrl: string;
  requestUrl: string;
  tracks: MusicTrack[];
};

const LIKES_STORAGE_KEY = "akimio-liked-tracks";

const audioUrlFor = (id: string) =>
  `https://music.163.com/song/media/outer/url?id=${id}.mp3`;

type KuwoMusicResponse = {
  code?: number;
  msg?: string;
  url?: string;
};

const resolveKuwoMusicUrl = (musicRid: string) =>
  new Promise<string>((resolve, reject) => {
    const callbackName = `__akimioMusic_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const callbackTarget = window as unknown as Record<
      string,
      ((payload: KuwoMusicResponse) => void) | undefined
    >;
    const script = document.createElement("script");
    let timeoutId = 0;

    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      script.remove();
      delete callbackTarget[callbackName];
    };

    callbackTarget[callbackName] = (payload) => {
      cleanup();

      if (payload.code !== 200 || !payload.url) {
        reject(new Error(payload.msg || "Kuwo Music did not return a playable URL."));
        return;
      }

      resolve(payload.url.replace(/^http:/, "https:"));
    };

    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error("Kuwo Music could not be reached."));
    };

    script.src =
      "https://antiserver.kuwo.cn/anti.s" +
      `?type=convert_url3&rid=${encodeURIComponent(musicRid)}` +
      `&format=mp3&response=jsonp&callback=${callbackName}`;
    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Kuwo Music request timed out."));
    }, 10000);
    document.head.append(script);
  });

export default function MusicPlayer({ imageUrl, requestUrl, tracks }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackRequestedRef = useRef(false);
  const playbackAttemptRef = useRef(0);
  const resumeAfterTrackChangeRef = useRef(false);
  const resolvedUrlsRef = useRef(new Map<string, string>());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(
    () => new Set()
  );

  const currentTrack = tracks[currentIndex] || tracks[0];

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(LIKES_STORAGE_KEY) || "[]"
      );
      if (Array.isArray(stored)) {
        setLikedTrackIds(
          new Set(stored.filter((id): id is string => typeof id === "string"))
        );
      }
    } catch {
      // Local likes are optional and should never stop the player.
    }
  }, []);

  const startPlayback = useCallback(async () => {
    const attempt = ++playbackAttemptRef.current;
    playbackRequestedRef.current = true;
    setPlaybackError(null);
    setIsLoading(true);

    const audio = audioRef.current;
    if (!audio) return;

    try {
      let playbackUrl = resolvedUrlsRef.current.get(currentTrack.id);
      if (!playbackUrl) {
        playbackUrl =
          currentTrack.playback.provider === "netease"
            ? audioUrlFor(currentTrack.id)
            : await resolveKuwoMusicUrl(currentTrack.playback.musicRid);
        resolvedUrlsRef.current.set(currentTrack.id, playbackUrl);
      }

      if (
        attempt !== playbackAttemptRef.current ||
        !playbackRequestedRef.current
      ) {
        return;
      }

      if (audio.src !== playbackUrl) {
        audio.src = playbackUrl;
        audio.load();
      }
      audio.volume = 0.72;
      await audio.play();
    } catch {
      if (attempt !== playbackAttemptRef.current) return;
      playbackRequestedRef.current = false;
      setIsPlaying(false);
      setPlaybackError("当前网络暂时无法播放，点击歌名可在网易云打开。");
    } finally {
      if (attempt === playbackAttemptRef.current) setIsLoading(false);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!resumeAfterTrackChangeRef.current) return;
    resumeAfterTrackChangeRef.current = false;
    void startPlayback();
  }, [currentTrack.id, startPlayback]);

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const requestTitle = encodeURIComponent("点歌留言");
  const requestBody = encodeURIComponent(
    `我想听的歌：\n歌手：\n网易云链接：\n\n当前播放：${currentTrack.title} - ${currentTrack.artist}`
  );
  const requestHref = `${requestUrl}?title=${requestTitle}&body=${requestBody}`;

  const stopPlayback = () => {
    playbackAttemptRef.current += 1;
    playbackRequestedRef.current = false;
    audioRef.current?.pause();
    setIsLoading(false);
    setIsPlaying(false);
  };

  const handleToggle = () => {
    if (isPlaying || isLoading) {
      stopPlayback();
      return;
    }
    void startPlayback();
  };

  const handleNext = (shouldResume = isPlaying || isLoading) => {
    playbackAttemptRef.current += 1;
    playbackRequestedRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setIsLoading(false);
    setPlaybackError(null);
    setIsPlaying(false);
    resumeAfterTrackChangeRef.current = shouldResume;
    setCurrentIndex((index) => (index + 1) % tracks.length);
  };

  const handleLike = () => {
    const next = new Set(likedTrackIds);
    if (next.has(currentTrack.id)) next.delete(currentTrack.id);
    else next.add(currentTrack.id);
    setLikedTrackIds(next);
    try {
      window.localStorage.setItem(
        LIKES_STORAGE_KEY,
        JSON.stringify([...next])
      );
    } catch {
      // Private browsing may disable localStorage.
    }
  };

  const actionLabel = isPlaying
    ? `暂停 ${currentTrack.title} - ${currentTrack.artist}`
    : isLoading
      ? `停止加载 ${currentTrack.title} - ${currentTrack.artist}`
    : `播放 ${currentTrack.title} - ${currentTrack.artist}`;

  return (
    <div className={`music-player${isPlaying ? " is-playing" : ""}`}>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
          setPlaybackError(null);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => handleNext(true)}
        onError={() => {
          if (!playbackRequestedRef.current) return;
          playbackRequestedRef.current = false;
          setIsLoading(false);
          setIsPlaying(false);
          setPlaybackError("当前网络暂时无法播放，点击歌名可在网易云打开。");
        }}
      />
      <button
        type="button"
        className="music-player-button"
        aria-label={actionLabel}
        title={actionLabel}
        onClick={handleToggle}
      >
        <img className="music-player-art" src={imageUrl} alt="" />
        <span className="music-player-control" aria-hidden="true">
          <FontAwesomeIcon
            icon={isLoading ? faSpinner : isPlaying ? faPause : faPlay}
            className={isLoading ? "is-loading" : undefined}
          />
        </span>
      </button>
      <div className="music-player-actions" role="group" aria-label="音乐操作">
        <a
          className="music-player-track"
          href={currentTrack.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="在网易云音乐打开当前歌曲"
        >
          <strong>{currentTrack.title}</strong>
          <span>{currentTrack.artist}</span>
          <small>
            {currentIndex + 1} / {tracks.length}
          </small>
        </a>
        {(isLoading || playbackError) && (
          <p
            className={`music-player-message${playbackError ? " is-error" : ""}`}
            role={playbackError ? "alert" : "status"}
          >
            {playbackError || "正在连接国内音源..."}
          </p>
        )}
        <button
          type="button"
          className="music-player-action"
          onClick={() => handleNext()}
          aria-label="下一首"
          title="下一首"
        >
          <FontAwesomeIcon icon={faForwardStep} aria-hidden="true" />
          <span>下一首</span>
        </button>
        <button
          type="button"
          className={`music-player-action${isLiked ? " is-liked" : ""}`}
          onClick={handleLike}
          aria-label={isLiked ? "取消点赞" : "点赞"}
          aria-pressed={isLiked}
          title={isLiked ? "取消点赞" : "点赞"}
        >
          <FontAwesomeIcon
            icon={isLiked ? faHeartSolid : faHeartRegular}
            aria-hidden="true"
          />
          <span>{isLiked ? "已点赞" : "点赞"}</span>
        </button>
        <a
          className="music-player-action"
          href={requestHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="给作者留言想听什么歌"
          title="给作者留言想听什么歌"
        >
          <FontAwesomeIcon icon={faCommentDots} aria-hidden="true" />
          <span>点歌留言</span>
        </a>
      </div>
      <span className="music-player-status" aria-live="polite">
        {playbackError ||
          (isLoading
            ? `正在加载 ${currentTrack.title}`
            : isPlaying
              ? `正在播放 ${currentTrack.title}`
              : `${currentTrack.title} 已暂停`)}
      </span>
    </div>
  );
}
