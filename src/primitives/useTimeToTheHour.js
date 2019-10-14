import { generateTimeContextConsumptionHook } from '../utilities';
import { ONE_HOUR } from '../durations';

const useTimeToTheHour = generateTimeContextConsumptionHook(ONE_HOUR.context);

export default useTimeToTheHour;
