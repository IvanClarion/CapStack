import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import ThemeText from './ThemeText';

// TypingText: progressively reveals text word-by-word.
// Props:
// - text: string to render
// - speed: ms per word (default 60ms)
// - startDelay: ms delay before starting (default 0)
// - className: pass-through styling for ThemeText
export default function TypingText({
  text = '',
  speed = 60,
  startDelay = 0,
  className = '',
}) {
  const [displayed, setDisplayed] = useState('');
  const timerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayed('');
    startedRef.current = false;

    // Gracefully handle reduced motion users
    let prefersReduced = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((val) => {
      prefersReduced = !!val;
      startTyping(prefersReduced);
    });

    function startTyping(reduced) {
      clearTimer();

      // Instant render if reduced motion or no speed
      if (reduced || speed <= 0) {
        setDisplayed(String(text ?? ''));
        return;
      }

      const full = String(text ?? '');
      const words = full.length ? full.split(/(\s+)/) : []; // keeps spaces/punctuation
      if (!words.length) return;

      const kickoff = () => {
        if (startedRef.current) return;
        startedRef.current = true;

        let idx = 0;
        setDisplayed('');

        timerRef.current = setInterval(() => {
          idx += 1;
          setDisplayed(words.slice(0, idx).join(''));
          if (idx >= words.length) {
            clearTimer();
          }
        }, speed);
      };

      if (startDelay > 0) {
        timerRef.current = setTimeout(kickoff, startDelay);
      } else {
        kickoff();
      }
    }

    function clearTimer() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      clearTimer();
    };
  }, [text, speed, startDelay]);

  return <ThemeText className={className}>{displayed}</ThemeText>;
}