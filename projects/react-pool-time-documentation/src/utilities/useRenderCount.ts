import { useEffect, useRef } from 'react';

const useRenderCount = (): number => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current = renderCount.current + 1;
  });

  return renderCount.current;
};

export default useRenderCount;
