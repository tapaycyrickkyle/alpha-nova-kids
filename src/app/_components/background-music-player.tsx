"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialSymbol } from "@/app/_components/material-symbol";
import {
  BACKGROUND_AUDIO_ASSET_KEY,
  BACKGROUND_AUDIO_BUCKET,
  BACKGROUND_AUDIO_UPDATED_EVENT,
  fetchBackgroundAudioPath,
} from "@/lib/supabase/background-audio-metadata";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MUSIC_ENABLED_STORAGE_KEY = "alpha-nova-kids-background-music-enabled";

function getPublicAudioUrl(filePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { data } = supabase.storage.from(BACKGROUND_AUDIO_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) !== "false";
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadBackgroundMusic() {
      try {
        const filePath = await fetchBackgroundAudioPath(BACKGROUND_AUDIO_ASSET_KEY);

        if (!filePath) {
          if (!isCancelled) {
            setAudioUrl(null);
          }
          return;
        }

        const signedUrl = getPublicAudioUrl(filePath);

        if (!isCancelled) {
          setAudioUrl(signedUrl);
        }
      } catch {
        if (!isCancelled) {
          setAudioUrl(null);
        }
      }
    }

    void loadBackgroundMusic();

    const handleRefresh = () => {
      void loadBackgroundMusic();
    };

    window.addEventListener(BACKGROUND_AUDIO_UPDATED_EVENT, handleRefresh);

    return () => {
      isCancelled = true;
      window.removeEventListener(BACKGROUND_AUDIO_UPDATED_EVENT, handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;

    if (!audioUrl || !isMusicEnabled) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    const tryPlay = async () => {
      try {
        audio.volume = 0.35;
        audio.load();
        await audio.play();
      } catch {
        // Wait for a user interaction if autoplay is blocked.
      }
    };

    void tryPlay();

    const handleFirstInteraction = () => {
      void tryPlay();
    };

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [audioUrl, isMusicEnabled]);

  function handleToggleMusic() {
    setIsMusicEnabled((current) => {
      const nextValue = !current;
      window.localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  }

  if (!audioUrl) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} loop preload="auto" className="hidden">
        <source src={audioUrl} />
        Your browser does not support audio playback.
      </audio>

      <button
        type="button"
        onClick={handleToggleMusic}
        aria-pressed={isMusicEnabled}
        aria-label={isMusicEnabled ? "Turn background music off" : "Turn background music on"}
        className="fixed right-4 bottom-4 z-[60] flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-3 text-sm font-semibold text-on-surface shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-xl md:right-6 md:bottom-6"
      >
        <MaterialSymbol
          name={isMusicEnabled ? "volume_up" : "volume_off"}
          className="size-4"
        />
        <span>{isMusicEnabled ? "Music On" : "Music Off"}</span>
      </button>
    </>
  );
}
