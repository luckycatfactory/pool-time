import MinuteContext from './TimeProviders/MinuteContext';
import { generateTimeContextConsumptionHook } from './TimeProviders/utilities';

const useTimeToTheMinute = generateTimeContextConsumptionHook(MinuteContext);

export default useTimeToTheMinute;
