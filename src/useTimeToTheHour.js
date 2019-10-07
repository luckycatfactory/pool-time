import HourContext from './TimeProviders/HourContext';
import { generateTimeContextConsumptionHook } from './TimeProviders/utilities';

const useTimeToTheHour = generateTimeContextConsumptionHook(HourContext);

export default useTimeToTheHour;
