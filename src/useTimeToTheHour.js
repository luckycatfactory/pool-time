import HourContext from './TimeProviders/HourContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheHour = generateTimeContextConsumptionHook(HourContext);

export default useTimeToTheHour;
