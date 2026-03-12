'use client';

import { useState, useEffect } from 'react';
import BlurText from './BlurText';

type RotatingTextProps = {
  lines: string[];
  delay?: number;
  className?: string;
};

export default function RotatingText({ lines, delay = 3500, className = '' }: RotatingTextProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => (prev + 1) % lines.length);
    }, delay);

    return () => clearInterval(interval);
  }, [delay, lines.length]);

  return (
    <BlurText
      key={currentLineIndex}
      text={lines[currentLineIndex]}
      delay={120}
      className={className}
      animateBy="words"
      direction="top"
    />
  );
}
