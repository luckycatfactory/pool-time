import { useContext, useMemo } from 'react';
import { DurationsContext } from '../TimeProviders';

const useLocalAccuracy = (getLocalAccuracyConfiguration, deps = []) => {
  const durations = useContext(DurationsContext);

  const localAccuracyMap = useMemo(() => {
    const localAccuracyConfiguration = getLocalAccuracyConfiguration();

    return localAccuracyConfiguration;
  }, [...deps, durations]);

  return localAccuracyMap;
};

export default useLocalAccuracy;
