import { generateTimeContextConsumptionHook } from '../utilities';
import { ONE_SECOND } from '../durations';

const useTimeToTheSecond = generateTimeContextConsumptionHook(ONE_SECOND.context);

export default useTimeToTheSecond;
