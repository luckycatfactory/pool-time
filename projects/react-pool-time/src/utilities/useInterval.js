import { useEffect, useRef } from 'react';

const useInterval = (callback, period) => {
  const callbackRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => callbackRef.current();

    if (period !== null) {
      const intervalId = setInterval(tick, period);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [period]);
};

export default useInterval;
