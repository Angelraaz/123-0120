import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false);
  const visible = useRef(true);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    function applyPreference() {
      const allow = !preference.matches && !connection?.saveData;
      if (!allow) videoRef.current?.pause();
      setEnabled(allow);
    }
    applyPreference();
    preference.addEventListener('change', applyPreference);
    return () => preference.removeEventListener('change', applyPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    function resume() {
      if (visible.current && !pausedByUser.current && !document.hidden) void video?.play().catch(() => setPlaying(false));
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) resume();
      else video.pause();
    }, { threshold: 0.08 });
    observer.observe(video);
    function onVisibility() { if (document.hidden) video?.pause(); else resume(); }
    document.addEventListener('visibilitychange', onVisibility);
    video.addEventListener('canplay', resume);
    resume();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      video.removeEventListener('canplay', resume);
      video.pause();
    };
  }, [enabled]);

  function toggle() {
    if (playing) { pausedByUser.current = true; videoRef.current?.pause(); }
    else {
      pausedByUser.current = false;
      if (!enabled) setEnabled(true);
      else void videoRef.current?.play().catch(() => setPlaying(false));
    }
  }

  return <>
    <div className="hero-backdrop" aria-hidden="true"><video ref={videoRef} aria-label="Video decorativo de reparación de laptop, sin sonido" aria-hidden="true" src={enabled ? '/videos/laptop-background.mp4' : undefined} poster="/images/laptop-poster.jpg" autoPlay={enabled} muted loop playsInline preload={enabled ? 'metadata' : 'none'} tabIndex={-1} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} /><div className="video-shade" /></div>
    <button className="video-toggle" onClick={toggle} aria-label={playing ? 'Pausar video de fondo' : 'Reproducir video de fondo'}>{playing ? <Pause size={14} /> : <Play size={14} />}<span>{playing ? 'Pausar fondo' : 'Reproducir fondo'}</span><small>Sin sonido</small></button>
  </>;
}