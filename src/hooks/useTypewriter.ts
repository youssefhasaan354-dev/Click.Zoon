import { useEffect, useState } from 'react';

export function useTypewriter(words: string[], speed = 120, pause = 1800) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setText(words[0]);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    const currentWord = words[wordIndex];

    if (isDeleting) {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
      }, speed / 2);
    } else {
      if (text === currentWord) {
        timeout = setTimeout(() => setIsDeleting(true), pause);
        return;
      }
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [text, wordIndex, isDeleting, words, speed, pause]);

  useEffect(() => {
    if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }
  }, [isDeleting, text, words.length]);

  return text;
}
