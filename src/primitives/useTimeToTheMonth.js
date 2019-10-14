import { generateTimeContextConsumptionHook } from '../utilities';
import { ONE_MONTH } from '../durations';

const useTimeToTheDay = generateTimeContextConsumptionHook(ONE_MONTH.context);

export default useTimeToTheDay;
