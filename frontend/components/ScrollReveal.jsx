"use client";
import { motion } from 'framer-motion';

export function ScrollReveal({ children, delay = 0, y = 40, direction = "up", className = "" }) {
  const initialData = { opacity: 0 };
  
  if (direction === "up") initialData.y = y;
  else if (direction === "down") initialData.y = -y;
  else if (direction === "left") initialData.x = -50;
  else if (direction === "right") initialData.x = 50;

  return (
    <motion.div
      initial={initialData}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
