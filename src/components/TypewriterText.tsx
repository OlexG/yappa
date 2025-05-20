import React, { useState, useEffect } from 'react';

const phrases = [
  "Anywhere.",
  "In your car.",
  "On a plane.",
  "At the beach.",
  "In a café.",
  "On the train.",
  "At home.",
  "In the park.",
];

export default function TypewriterText() {
  const [text, setText] = useState("Anywhere.");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Start the animation after 7 seconds
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, 7000);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!started) return;

    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = 150;
    const deletingSpeed = 100;
    const pauseTime = 2000;

    let timer: NodeJS.Timeout;

    if (!isDeleting && text === currentPhrase) {
      // Pause at full phrase
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && text === "") {
      // Move to next phrase
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      // Type or delete
      const delta = isDeleting ? -1 : 1;
      const nextText = currentPhrase.substring(0, text.length + delta);
      timer = setTimeout(() => {
        setText(nextText);
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex, started]);

  return (
    <span className="inline-block min-w-[200px]">
      {text}
      <span className="animate-blink">|</span>
    </span>
  );
} 