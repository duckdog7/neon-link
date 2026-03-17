import { useState, useEffect } from 'react';

export function useNightMode() {
  const [isNight, setIsNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 22 || h < 6;
  });

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setIsNight(h >= 22 || h < 6);
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return isNight;
}
