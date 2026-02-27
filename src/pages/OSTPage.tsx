import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, ExternalLink, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

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
  vinylColor: string;
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
    vinylColor: '#1a0a2e',
    tracks: [
      { no: 1, title: 'Born to Rise', artist: 'Honor of Kings', duration: '3:34', youtubeId: 'xBNr5tAGKkE' },
      { no: 2, title: 'The Contender', artist: 'Honor of Kings', duration: '3:12', youtubeId: 'f7LKByFTFfI' },
      { no: 3, title: 'Invincible', artist: 'Honor of Kings', duration: '3:28', youtubeId: 'UiC3HgFGRhA' },
      { no: 4, title: 'Burn The Flame', artist: 'SB19 × Honor of Kings', duration: '3:05', youtubeId: 'h2wjFGZxFCw' },
      { no: 5, title: 'Atlas of Tomorrow', artist: 'JJ Lin feat. Taeil', duration: '4:44', youtubeId: 'MWkGrGOKKSE' },
    ],
    spotifyUrl: 'https://open.spotify.com/artist/4eV4kF4vkWWaRbzZdNUx0n',
    appleMusicUrl: 'https://music.apple.com/us/artist/honor-of-kings/1668601498',
    youtubeUrl: 'https://www.youtube.com/@HonorOfKings',
  },
  {
    id: 'ost2024',
    title: 'Original Game Soundtrack Collection 2024',
    subtitle: '2024 · 50 tracks',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7f/25/83/7f258345-34d0-0537-26e1-7deee073dc72/859792513249_cover.jpg/600x600bf-60.jpg',
    vinylColor: '#0d1a0a',
    tracks: [
      { no: 1, title: 'Born to Rise', artist: 'Honor of Kings', duration: '3:34' },
      { no: 2, title: 'The Contender', artist: 'Honor of Kings', duration: '3:12' },
      { no: 3, title: 'Invincible', artist: 'Honor of Kings', duration: '3:28' },
      { no: 4, title: 'Burn The Flame', artist: 'SB19 × Honor of Kings', duration: '3:05' },
      { no: 5, title: 'Atlas of Tomorrow', artist: 'JJ Lin feat. Taeil', duration: '4:44' },
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
    title: 'Original Game Soundtrack Vol. 1',
    subtitle: '2020 · 16 tracks',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c3/04/37/c30437e4-c7a5-3218-e028-5bc4ea35f6a2/4895216700368_cover.jpg/600x600bf-60.jpg',
    vinylColor: '#1a0d00',
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

function VinylRecord({ cover, isPlaying, size = 320 }: { cover: string; isPlaying: boolean; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Vinyl base */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at center, #2a2a2a 28%, #111 28.5%, #1a1a1a 35%, #111 35.5%, #1a1a1a 42%, #111 42.5%, #1a1a1a 49%, #111 49.5%, #222 50%)',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.8)',
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.5, ease: 'easeOut' }}
      >
        {/* Grooves */}
        {[30, 36, 42, 48, 54, 60, 66, 72, 78, 84].map((r) => (
          <div
            key={r}
            className="absolute inset-0 rounded-full border border-white/[0.03]"
            style={{ margin: `${r * size / 320}px` }}
          />
        ))}
        {/* Shine */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </motion.div>

      {/* Album art in center */}
      <motion.div
        className="absolute rounded-full overflow-hidden"
        style={{
          width: size * 0.44,
          height: size * 0.44,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.1)',
        }}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.5, ease: 'easeOut' }}
      >
        <img src={cover} alt="Album Art" className="w-full h-full object-cover" />
        {/* Center spindle hole */}
        <div
          className="absolute rounded-full bg-dark-400"
          style={{
            width: size * 0.04,
            height: size * 0.04,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function OSTPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album>(ALBUMS[0]);
  const [selectedTrack, setSelectedTrack] = useState<Track>(ALBUMS[0].tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentTrackIndex = selectedAlbum.tracks.findIndex(t => t.no === selectedTrack.no);

  const playTrack = (track: Track) => {
    if (selectedTrack.no === track.no) {
      setIsPlaying(p => !p);
    } else {
      setSelectedTrack(track);
      setIsPlaying(true);
    }
  };

  const prevTrack = () => {
    const idx = currentTrackIndex;
    if (idx > 0) {
      setSelectedTrack(selectedAlbum.tracks[idx - 1]);
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    const idx = currentTrackIndex;
    if (idx < selectedAlbum.tracks.length - 1) {
      setSelectedTrack(selectedAlbum.tracks[idx + 1]);
      setIsPlaying(true);
    }
  };

  const selectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedTrack(album.tracks[0]);
    setIsPlaying(false);
  };

  // YouTube embed URL
  const youtubeEmbedUrl = selectedTrack.youtubeId && isPlaying
    ? `https://www.youtube.com/embed/${selectedTrack.youtubeId}?autoplay=1&controls=0&modestbranding=1`
    : null;

  return (
    <div className="min-h-screen bg-dark-400">

      {/* Hero / Player Section */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Dynamic blurred background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAlbum.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={selectedAlbum.cover}
              alt=""
              className="w-full h-full object-cover scale-110"
              style={{ filter: 'blur(80px) saturate(1.5)', transform: 'scale(1.2)' }}
            />
            <div className="absolute inset-0 bg-dark-400/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-400/60 via-transparent to-dark-400" />
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
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {album.title}
              </button>
            ))}
          </div>

          {/* Main player layout */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Vinyl */}
            <div className="flex-shrink-0 flex flex-col items-center gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedAlbum.id}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <VinylRecord
                    cover={selectedAlbum.cover}
                    isPlaying={isPlaying}
                    size={300}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Player controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={prevTrack}
                  disabled={currentTrackIndex === 0}
                  className="p-2 rounded-full transition-all"
                  style={{ color: currentTrackIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }}
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {isPlaying
                    ? <Pause className="w-6 h-6 text-dark-400" />
                    : <Play className="w-6 h-6 text-dark-400 ml-0.5" />
                  }
                </button>

                <button
                  onClick={nextTrack}
                  disabled={currentTrackIndex === selectedAlbum.tracks.length - 1}
                  className="p-2 rounded-full transition-all"
                  style={{ color: currentTrackIndex === selectedAlbum.tracks.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }}
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Stream links */}
              <div className="flex items-center gap-3">
                {selectedAlbum.spotifyUrl && (
                  <a
                    href={selectedAlbum.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: '#1DB954', color: '#000' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Spotify
                  </a>
                )}
                {selectedAlbum.appleMusicUrl && (
                  <a
                    href={selectedAlbum.appleMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #fc3c44, #ff2d55)', color: '#fff' }}
                  >
                    <Music2 className="w-3.5 h-3.5" />
                    Apple Music
                  </a>
                )}
                {selectedAlbum.youtubeUrl && (
                  <a
                    href={selectedAlbum.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: '#FF0000', color: '#fff' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {selectedAlbum.subtitle} · Track {selectedTrack.no}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">
                    {selectedTrack.title}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-base">
                    {selectedTrack.artist}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Track list */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  maxHeight: '380px',
                  overflowY: 'auto',
                }}
              >
                {selectedAlbum.tracks.map((track) => {
                  const isActive = track.no === selectedTrack.no;
                  return (
                    <button
                      key={track.no}
                      onClick={() => playTrack(track)}
                      className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      {/* Track number / play icon */}
                      <div className="w-6 flex-shrink-0 flex items-center justify-center">
                        {isActive && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-4">
                            {[0, 0.2, 0.4].map((delay) => (
                              <motion.div
                                key={delay}
                                className="w-1 rounded-full"
                                style={{ background: '#fff' }}
                                animate={{ height: ['4px', '12px', '4px'] }}
                                transition={{ duration: 0.8, delay, repeat: Infinity }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span
                            className="text-sm"
                            style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {track.no}
                          </span>
                        )}
                      </div>

                      {/* Title & artist */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.8)' }}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {track.artist}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
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

      {/* YouTube embed (hidden, just for audio) */}
      {youtubeEmbedUrl && (
        <div className="fixed bottom-0 right-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl}
            allow="autoplay"
            title="audio-player"
          />
        </div>
      )}

      {/* Note banner */}
      {isPlaying && selectedTrack.youtubeId && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm"
          style={{
            background: 'rgba(10,10,20,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <Volume2 className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
          <span>
            Now playing: <strong style={{ color: '#fff' }}>{selectedTrack.title}</strong>
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${selectedTrack.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ color: '#a78bfa' }}
          >
            Watch on YouTube
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Albums overview section */}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                    ? '1px solid rgba(255,255,255,0.2)'
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
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
