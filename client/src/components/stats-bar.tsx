import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Companies Hiring", value: 100, suffix: "+" },
  { label: "Students Placed", value: 200, suffix: "+" },
  { label: "Highest Package", value: 20, suffix: " LPA" },
  { label: "Industry Experts", value: 100, suffix: "+" },
  { label: "Highest Salary Hike", value: 200, suffix: "%" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return count;
}

function StatItem({ label, value, suffix, started }: { label: string; value: number; suffix: string; started: boolean }) {
  const count = useCountUp(value, 1500, started);
  return (
    <div className="flex flex-col items-center py-4 px-2">
      <span className="text-xs sm:text-sm text-gray-500 font-medium mb-1">{label}</span>
      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
        {count}{suffix}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {stats.map((stat) => (
          <StatItem key={stat.label} label={stat.label} value={stat.value} suffix={stat.suffix} started={started} />
        ))}
      </div>
    </div>
  );
}
