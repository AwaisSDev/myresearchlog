import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLMotionProps<"div"> & { children: ReactNode; hover?: boolean };

export const GlassCard = forwardRef<HTMLDivElement, Props>(({ className, children, hover = true, ...rest }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
    className={cn("glass rounded-2xl p-5 transition-shadow hover:shadow-elevated", className)}
    {...rest}
  >
    {children}
  </motion.div>
));
GlassCard.displayName = "GlassCard";
