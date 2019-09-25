import MinuteContext from './TimeProviders/MinuteContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheMinute = generateTimeContextConsumptionHook(MinuteContext);

export default useTimeToTheMinute;
