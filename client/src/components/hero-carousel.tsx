import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  children: React.ReactNode[];
}

export default function HeroCarousel({ children }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const total = children.length;

  const next = useCallback(() => setCurrent(p => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(p => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <div
      className="hero-carousel-wrapper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        .hero-carousel-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          display: block;
          clear: both;
        }
        .hero-slide-sizer {
          position: relative;
          width: 100%;
          z-index: 1;
          transition: opacity 0.6s ease-in-out;
        }
        .hero-slide-sizer > * {
          width: 100%;
        }
        .hero-slide-abs {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          transition: opacity 0.6s ease-in-out;
          display: flex;
          align-items: stretch;
        }
        .hero-slide-abs > * {
          width: 100%;
          min-height: 100%;
        }
        .hero-slide-sizer.inactive {
          opacity: 0;
          pointer-events: none;
        }
        .hero-slide-sizer.active {
          opacity: 1;
          pointer-events: auto;
        }
        .hero-slide-abs.inactive {
          opacity: 0;
          pointer-events: none;
        }
        .hero-slide-abs.active {
          opacity: 1;
          pointer-events: auto;
          z-index: 1;
        }
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
        }
        .carousel-arrow:hover {
          background: rgba(0,0,0,0.7);
        }
        .carousel-arrow.left { left: 16px; }
        .carousel-arrow.right { right: 16px; }
        @media (max-width: 768px) {
          .carousel-arrow { display: none; }
        }
        .carousel-dots {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 10px;
        }
        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          padding: 0;
        }
        .carousel-dot.active {
          background: white;
          transform: scale(1.2);
        }
      `}</style>

      {children.map((child, i) => {
        if (i === 0) {
          return (
            <div key={i} className={`hero-slide-sizer ${i === current ? 'active' : 'inactive'}`}>
              {child}
            </div>
          );
        }
        return (
          <div key={i} className={`hero-slide-abs ${i === current ? 'active' : 'inactive'}`}>
            {child}
          </div>
        );
      })}

      <button className="carousel-arrow left" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button className="carousel-arrow right" onClick={next} aria-label="Next slide">
        <ChevronRight size={22} />
      </button>

      <div className="carousel-dots">
        {children.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}