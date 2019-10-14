import { generateTimeContextConsumptionHook } from '../utilities';
import { ONE_MINUTE } from '../durations';

const useTimeToTheMinute = generateTimeContextConsumptionHook(ONE_MINUTE.context);

export default useTimeToTheMinute;
