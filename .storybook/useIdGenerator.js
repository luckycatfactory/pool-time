import { useCallback, useRef } from 'react';

const useIdGenerator = () => {
  const id = useRef(0);

  const generateId = useCallback(() => {
    const latestId = id.current;
    id.current = latestId + 1;
    return latestId;
  }, []);

  return generateId;
};

export default useIdGenerator;
