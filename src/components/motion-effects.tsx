'use client';
import { useEffect, useSyncExternalStore, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
const eventName = 'libtech-motion-change';
function subscribe(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  window.addEventListener(eventName, callback);
  return () => {
    media.removeEventListener('change', callback);
    window.removeEventListener(eventName, callback);
  };
}
function enabledSnapshot() {
  try {
    return (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      localStorage.getItem('libtech-motion') !== 'off'
    );
  } catch {
    return false;
  }
}
export function MotionEffects() {
  const pathname = usePathname();
  const enabled = useSyncExternalStore(subscribe, enabledSnapshot, () => false);
  const seen = useRef(new WeakSet<Element>());
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? 'on' : 'off';
    if (!enabled) {
      document.getAnimations().forEach((a) => a.cancel());
      return;
    }
    const active = new Set<Animation>();
    const targets =
      '.hero-intro > *, .hero-lesson, .section-heading, .feature-course, .step-card, .faq-section > div, .closing, .page-heading, .stat-card, .learning-card, .level-card, .activity, .auth-card > *, .auth-preview, .course-card, .exercise-block, .example-block, .summary-block, .certificate-card, .checkout-summary';
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((entry, index) => {
            const element = entry.target;
            observer.unobserve(element);
            if (seen.current.has(element)) return;
            seen.current.add(element);
            const animation = element.animate(
              [
                { opacity: 0, transform: 'translateY(22px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              {
                duration: 650,
                delay: Math.min(index * 65, 260),
                easing: 'cubic-bezier(.16,1,.3,1)',
                fill: 'backwards',
              },
            );
            active.add(animation);
            animation.finished
              .then(() => active.delete(animation))
              .catch(() => active.delete(animation));
          });
      },
      { threshold: 0.08, rootMargin: '0px 0px -15px 0px' },
    );
    function scan(root: ParentNode) {
      root.querySelectorAll(targets).forEach((element) => {
        if (!seen.current.has(element)) observer.observe(element);
      });
    }
    scan(document);
    const mutations = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (node instanceof HTMLElement) {
            if (node.matches(targets) && !seen.current.has(node)) observer.observe(node);
            scan(node);
          }
    });
    mutations.observe(document.getElementById('main-content')!, { childList: true, subtree: true });
    const glow = document.querySelector<HTMLElement>('.hero');
    let frame = 0;
    function point(event: PointerEvent) {
      if (!glow || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = glow!.getBoundingClientRect();
        glow!.style.setProperty('--glow-x', Math.round(event.clientX - rect.left) + 'px');
        glow!.style.setProperty('--glow-y', Math.round(event.clientY - rect.top) + 'px');
      });
    }
    glow?.addEventListener('pointermove', point, { passive: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      glow?.removeEventListener('pointermove', point);
      active.forEach((a) => a.cancel());
    };
  }, [enabled, pathname]);
  function toggle() {
    try {
      localStorage.setItem('libtech-motion', enabled ? 'off' : 'on');
    } catch {}
    window.dispatchEvent(new Event(eventName));
  }
  return (
    <button
      className="motion-toggle no-print"
      onClick={toggle}
      aria-label={enabled ? 'Pause animations' : 'Enable animations'}
      title={enabled ? 'Pause animations' : 'Enable animations'}
      aria-pressed={enabled}
    >
      {enabled ? <Pause size={13} /> : <Play size={13} />}
      <span>{enabled ? 'Motion on' : 'Motion off'}</span>
    </button>
  );
}
export function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!enabledSnapshot() || !ref.current) return;
    const element = ref.current;
    let frame = 0;
    let start: number | undefined;
    const tick = (time: number) => {
      start ??= time;
      const progress = Math.min((time - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(value * eased).toLocaleString() + suffix;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      element.textContent = value.toLocaleString() + suffix;
    };
  }, [value, suffix]);
  return (
    <span ref={ref} aria-label={value.toLocaleString() + suffix}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
export function celebrateCompletion() {
  if (!enabledSnapshot()) return;
  const host = document.createElement('div');
  host.className = 'celebration';
  host.setAttribute('aria-hidden', 'true');
  document.body.append(host);
  const colors = ['#65e4d3', '#b9a2ff', '#f4c481', '#d2f8ec'];
  for (let i = 0; i < 22; i++) {
    const piece = document.createElement('i');
    piece.style.background = colors[i % 4];
    piece.style.left = 45 + (i % 7) * 1.7 + '%';
    host.append(piece);
    const spread = (i - 11) * 25;
    const a = piece.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: 0.1 },
        {
          transform:
            'translate(' + spread + 'px,-' + (100 + (i % 6) * 25) + 'px) rotate(' + i * 41 + 'deg)',
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: 'translate(' + spread * 1.25 + 'px,90px) rotate(' + i * 73 + 'deg)',
          opacity: 0,
        },
      ],
      {
        duration: 1000 + (i % 5) * 90,
        delay: i * 8,
        easing: 'cubic-bezier(.2,.7,.4,1)',
        fill: 'forwards',
      },
    );
    a.finished.catch(() => {});
  }
  window.setTimeout(() => host.remove(), 1800);
}
