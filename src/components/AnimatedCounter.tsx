import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, duration = 1, className }: { value: number; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    const to = value;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line
  }, [value]);
  return <motion.span className={className}>{Math.round(display).toLocaleString()}</motion.span>;
}
