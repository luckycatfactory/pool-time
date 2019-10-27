import { useContext, useMemo } from 'react';
import { DurationsContext } from '../TimeProviders';
import { AccuracyList, AccuracyMap, DurationList } from '../classes';

const useLocalAccuracy = (getLocalAccuracyConfiguration, deps = []) => {
  const durations = useContext(DurationsContext);

  // The duration list really should never be re-computed since durations should
  // only ever be passed in at initial script evaluation.
  const durationList = useMemo(() => new DurationList(durations), [durations]);
  const accuracyList = useMemo(() => new AccuracyList(getLocalAccuracyConfiguration()), deps);

  const localAccuracyMap = useMemo(() => new AccuracyMap(durationList, accuracyList), [
    accuracyList,
    durationList,
  ]);

  return localAccuracyMap;
};

export default useLocalAccuracy;
