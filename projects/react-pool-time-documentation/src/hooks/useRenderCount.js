import { useRef } from 'react';

const useRenderCount = () => {
  const countRef = useRef(0);

  countRef.current = countRef.current + 1;

  return countRef.current;
};

export default useRenderCount;
