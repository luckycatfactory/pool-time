import { generateTimeContextConsumptionHook } from '../utilities';
import { ONE_YEAR } from '../durations';

const useTimeToTheYear = generateTimeContextConsumptionHook(ONE_YEAR.context);

export default useTimeToTheYear;
