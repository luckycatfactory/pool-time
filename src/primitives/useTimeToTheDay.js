import { generateTimeContextConsumptionHook } from '../utilities';
import { ONE_DAY } from '../durations';

const useTimeToTheDay = generateTimeContextConsumptionHook(ONE_DAY.context);

export default useTimeToTheDay;
