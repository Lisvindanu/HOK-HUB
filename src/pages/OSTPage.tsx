import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, ExternalLink, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2 } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUDIO_PROXY = 'https://mediavault.project-n.site/api/public/audio';

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Track {
  no: number;
  title: string;
  artist: string;
  duration: string;
  youtubeId?: string;
}

interface Album {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  tracks: Track[];
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
}

const ALBUMS: Album[] = [
  {
    id: 'singles',
    title: 'Featured Singles',
    subtitle: '2023 – 2024',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/0a/ce/72/0ace723f-f541-3f60-8955-73a1ff1c49c5/859780948459_cover.jpg/600x600bf-60.jpg',
    tracks: [
      { no: 1, title: 'Born to Rise', artist: 'Honor of Kings', duration: '3:34', youtubeId: 'R4ZK6sbwL5k' },
      { no: 2, title: 'The Contender', artist: 'Honor of Kings', duration: '3:12', youtubeId: '6dy--TPIE-Y' },
      { no: 3, title: 'Invincible', artist: 'Honor of Kings', duration: '3:28', youtubeId: 'IsBNGBKa_Fs' },
      { no: 4, title: 'Burn The Flame', artist: 'SB19 × Honor of Kings', duration: '3:05', youtubeId: 'JqGobBBBHqQ' },
      { no: 5, title: 'Atlas of Tomorrow', artist: 'JJ Lin feat. Taeil', duration: '4:44', youtubeId: 'Ra6tyMqBoss' },
    ],
    spotifyUrl: 'https://open.spotify.com/artist/4eV4kF4vkWWaRbzZdNUx0n',
    appleMusicUrl: 'https://music.apple.com/us/artist/honor-of-kings/1668601498',
    youtubeUrl: 'https://www.youtube.com/@HonorOfKings',
  },
  {
    id: 'ost2024',
    title: 'OST Collection 2024',
    subtitle: '2024 · 50 tracks',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7f/25/83/7f258345-34d0-0537-26e1-7deee073dc72/859792513249_cover.jpg/600x600bf-60.jpg',
    tracks: [
      { no: 1, title: 'Born to Rise', artist: 'Honor of Kings', duration: '3:34', youtubeId: 'R4ZK6sbwL5k' },
      { no: 2, title: 'The Contender', artist: 'Honor of Kings', duration: '3:12', youtubeId: '6dy--TPIE-Y' },
      { no: 3, title: 'Invincible', artist: 'Honor of Kings', duration: '3:28', youtubeId: 'IsBNGBKa_Fs' },
      { no: 4, title: 'Burn The Flame', artist: 'SB19 × Honor of Kings', duration: '3:05', youtubeId: 'JqGobBBBHqQ' },
      { no: 5, title: 'Atlas of Tomorrow', artist: 'JJ Lin feat. Taeil', duration: '4:44', youtubeId: 'Ra6tyMqBoss' },
      { no: 6, title: 'Eternal Throne', artist: 'Honor of Kings', duration: '3:15' },
      { no: 7, title: 'Dragon\'s March', artist: 'Honor of Kings', duration: '2:58' },
      { no: 8, title: 'The Final Stand', artist: 'Honor of Kings', duration: '3:41' },
      { no: 9, title: 'Rise of the Warrior', artist: 'Honor of Kings', duration: '3:22' },
      { no: 10, title: 'Shadow of Valor', artist: 'Honor of Kings', duration: '4:01' },
    ],
    spotifyUrl: 'https://open.spotify.com/album/7dPSuXVUxhEEHVKgjlPiMh',
    appleMusicUrl: 'https://music.apple.com/us/album/honor-of-kings-original-game-soundtrack-collection-2024/1763051886',
  },
  {
    id: 'vol1',
    title: 'OST Vol. 1',
    subtitle: '2020 · 16 tracks',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c3/04/37/c30437e4-c7a5-3218-e028-5bc4ea35f6a2/4895216700368_cover.jpg/600x600bf-60.jpg',
    tracks: [
      { no: 1, title: 'War Song Origins', artist: 'Honor of Kings', duration: '3:05' },
      { no: 2, title: 'Lion Dance', artist: 'Honor of Kings', duration: '2:48' },
      { no: 3, title: 'The Art of War', artist: 'Honor of Kings', duration: '3:21' },
      { no: 4, title: 'Fields of War', artist: 'Honor of Kings', duration: '2:55' },
      { no: 5, title: 'Dragon Palace', artist: 'Honor of Kings', duration: '3:10' },
      { no: 6, title: 'The Ancient Forest', artist: 'Honor of Kings', duration: '3:34' },
      { no: 7, title: 'Battle Hymn', artist: 'Honor of Kings', duration: '2:47' },
      { no: 8, title: 'Celestial Temple', artist: 'Honor of Kings', duration: '3:28' },
      { no: 9, title: 'Eternal War', artist: 'Honor of Kings', duration: '3:15' },
      { no: 10, title: 'Rising Phoenix', artist: 'Honor of Kings', duration: '3:02' },
      { no: 11, title: 'Silent Tundra', artist: 'Honor of Kings', duration: '2:58' },
      { no: 12, title: 'Storm of Blades', artist: 'Honor of Kings', duration: '3:44' },
      { no: 13, title: 'Mountain Pass', artist: 'Honor of Kings', duration: '2:50' },
      { no: 14, title: 'The Rift', artist: 'Honor of Kings', duration: '3:17' },
      { no: 15, title: 'Throne of Glory', artist: 'Honor of Kings', duration: '4:12' },
      { no: 16, title: 'War Song (Full)', artist: 'Honor of Kings', duration: '4:55' },
    ],
    spotifyUrl: 'https://open.spotify.com/album/1G6AKEjswii05LYbwJbGmK',
    appleMusicUrl: 'https://music.apple.com/us/album/honor-of-kings-original-game-soundtrack-vol-1/1545742703',
  },
];

// ─── Vinyl Component ──────────────────────────────────────────────────────────

function VinylRecord({ cover, isPlaying, size = 300 }: { cover: string; isPlaying: boolean; size?: number }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Vinyl base */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at center, #2a2a2a 28%, #111 28.5%, #1a1a1a 35%, #111 35.5%, #1a1a1a 42%, #111 42.5%, #1a1a1a 49%, #111 49.5%, #222 50%)',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.8)',
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.8, ease: 'easeOut' }}
      >
        {/* Groove rings */}
        {[30, 38, 46, 54, 62, 70, 78, 86].map((r) => (
          <div
            key={r}
            className="absolute inset-0 rounded-full border"
            style={{ margin: r * size / 320, borderColor: 'rgba(255,255,255,0.03)' }}
          />
        ))}
        {/* Shine */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />
      </motion.div>

      {/* Album art center */}
      <motion.div
        className="absolute rounded-full overflow-hidden"
        style={{
          width: size * 0.44,
          height: size * 0.44,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.6)',
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.8, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={cover}
            src={cover}
            alt="Track Art"
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        {/* Spindle hole */}
        <div
          className="absolute rounded-full bg-dark-400"
          style={{
            width: size * 0.04,
            height: size * 0.04,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.9)',
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ currentTime, duration, onSeek }: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div
        ref={barRef}
        onClick={handleClick}
        className="group relative h-1 rounded-full cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.12)' }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: 'rgba(255,255,255,0.9)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(currentTime)}</span>
        <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(duration)}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function OSTPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album>(ALBUMS[0]);
  const [selectedTrack, setSelectedTrack] = useState<Track>(ALBUMS[0].tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Current track art: YouTube thumbnail if available, else album cover
  const trackCover = selectedTrack.youtubeId
    ? ytThumb(selectedTrack.youtubeId)
    : selectedAlbum.cover;

  // Audio src
  const audioSrc = selectedTrack.youtubeId
    ? `${AUDIO_PROXY}/${selectedTrack.youtubeId}`
    : null;

  const currentTrackIndex = selectedAlbum.tracks.findIndex(t => t.no === selectedTrack.no);

  // Sync audio state when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setDuration(0);

    if (audioSrc && isPlaying) {
      audio.load();
      setIsLoading(true);
      audio.play().catch(() => setIsPlaying(false));
    } else if (!audioSrc) {
      audio.pause();
    }
  }, [selectedTrack.no]);

  // Play/pause when isPlaying changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (isPlaying) {
      setIsLoading(true);
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Audio event handlers
  const onTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);
  const onLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);
  const onCanPlay = useCallback(() => setIsLoading(false), []);
  const onWaiting = useCallback(() => setIsLoading(true), []);
  const onEnded = useCallback(() => {
    // Auto advance to next track
    const nextIdx = currentTrackIndex + 1;
    if (nextIdx < selectedAlbum.tracks.length) {
      setSelectedTrack(selectedAlbum.tracks[nextIdx]);
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex, selectedAlbum]);

  const handleSeek = (t: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const togglePlay = () => {
    if (!audioSrc) return; // No audio available for this track
    setIsPlaying(p => !p);
  };

  const playTrack = (track: Track) => {
    if (selectedTrack.no === track.no) {
      togglePlay();
    } else {
      setSelectedTrack(track);
      setIsPlaying(true);
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) {
      setSelectedTrack(selectedAlbum.tracks[currentTrackIndex - 1]);
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (currentTrackIndex < selectedAlbum.tracks.length - 1) {
      setSelectedTrack(selectedAlbum.tracks[currentTrackIndex + 1]);
      setIsPlaying(true);
    }
  };

  const selectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedTrack(album.tracks[0]);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-dark-400">

      {/* Hidden audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          muted={isMuted}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onCanPlay={onCanPlay}
          onWaiting={onWaiting}
          onEnded={onEnded}
          preload="none"
        />
      )}

      {/* Hero / Player Section */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Blurred background — uses current track art */}
        <AnimatePresence mode="wait">
          <motion.div
            key={trackCover}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={trackCover}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(80px) saturate(1.6)', transform: 'scale(1.3)' }}
            />
            <div className="absolute inset-0 bg-dark-400/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-400/50 via-transparent to-dark-400" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-20 pb-16">

          {/* Album selector tabs */}
          <div className="flex gap-2 flex-wrap mb-12 justify-center">
            {ALBUMS.map((album) => (
              <button
                key={album.id}
                onClick={() => selectAlbum(album)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={selectedAlbum.id === album.id ? {
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(12px)',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {album.title}
              </button>
            ))}
          </div>

          {/* Main player layout */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Vinyl + controls */}
            <div className="flex-shrink-0 flex flex-col items-center gap-6 w-full lg:w-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedAlbum.id}
                  initial={{ opacity: 0, scale: 0.88, rotateY: 60 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.45, type: 'spring', stiffness: 220 }}
                >
                  <VinylRecord cover={trackCover} isPlaying={isPlaying && !isLoading} />
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="w-full max-w-xs px-2">
                <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-5">
                <button
                  onClick={prevTrack}
                  disabled={currentTrackIndex === 0}
                  className="p-1.5 rounded-full transition-opacity"
                  style={{ color: currentTrackIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)' }}
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  disabled={!audioSrc}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {isLoading && isPlaying
                    ? <Loader2 className="w-6 h-6 text-dark-400 animate-spin" />
                    : isPlaying
                      ? <Pause className="w-6 h-6 text-dark-400" />
                      : <Play className="w-6 h-6 text-dark-400 ml-0.5" />
                  }
                </button>

                <button
                  onClick={nextTrack}
                  disabled={currentTrackIndex === selectedAlbum.tracks.length - 1}
                  className="p-1.5 rounded-full transition-opacity"
                  style={{ color: currentTrackIndex === selectedAlbum.tracks.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)' }}
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setIsMuted(m => !m);
                    if (audioRef.current) audioRef.current.muted = !isMuted;
                  }}
                  className="p-1.5 rounded-full"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Streaming links */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {selectedAlbum.spotifyUrl && (
                  <a
                    href={selectedAlbum.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-85"
                    style={{ background: '#1DB954', color: '#000' }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    Spotify
                  </a>
                )}
                {selectedAlbum.appleMusicUrl && (
                  <a
                    href={selectedAlbum.appleMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-85"
                    style={{ background: 'linear-gradient(135deg, #fc3c44, #ff2d55)', color: '#fff' }}
                  >
                    <Music2 className="w-3 h-3" />
                    Apple Music
                  </a>
                )}
                {selectedAlbum.youtubeUrl && (
                  <a
                    href={selectedAlbum.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-85"
                    style={{ background: '#FF0000', color: '#fff' }}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Track info + list */}
            <div className="flex-1 w-full max-w-lg">
              {/* Current track info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTrack.no + selectedAlbum.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="mb-6"
                >
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {selectedAlbum.subtitle} · Track {selectedTrack.no}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                    {selectedTrack.title}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-base">
                    {selectedTrack.artist}
                  </p>
                  {!audioSrc && (
                    <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <ExternalLink className="w-3 h-3" />
                      Audio not available — listen on Spotify or Apple Music
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Track list */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                  maxHeight: '420px',
                  overflowY: 'auto',
                }}
              >
                {selectedAlbum.tracks.map((track) => {
                  const isActive = track.no === selectedTrack.no;
                  const thumb = track.youtubeId ? ytThumb(track.youtubeId) : null;

                  return (
                    <button
                      key={track.no}
                      onClick={() => playTrack(track)}
                      className="w-full flex items-center gap-3.5 px-4 py-3 text-left transition-all"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      {/* Track thumbnail or number */}
                      <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden relative"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {thumb ? (
                          <img src={thumb} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{track.no}</span>
                          </div>
                        )}
                        {/* Playing overlay */}
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.5)' }}>
                            {isActive && isPlaying ? (
                              <div className="flex items-end gap-0.5 h-4">
                                {[0, 0.15, 0.3].map((delay) => (
                                  <motion.div
                                    key={delay}
                                    className="w-1 rounded-full bg-white"
                                    animate={{ height: ['4px', '12px', '4px'] }}
                                    transition={{ duration: 0.7, delay, repeat: Infinity }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <Play className="w-4 h-4 text-white" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Title & artist */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.75)' }}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {track.artist}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discography */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2
            className="text-2xl md:text-3xl font-display font-bold text-white mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Discography
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {ALBUMS.map((album, idx) => (
              <motion.button
                key={album.id}
                onClick={() => selectAlbum(album)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: selectedAlbum.id === album.id
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  border: selectedAlbum.id === album.id
                    ? '1px solid rgba(255,255,255,0.18)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {album.subtitle}
                  </p>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {album.title}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
