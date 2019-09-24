import HourContext from './TimeProvider/HourContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheHour = generateTimeContextConsumptionHook(HourContext);

export default useTimeToTheHour;
