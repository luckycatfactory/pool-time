import DayContext from './TimeProvider/DayContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheDay = generateTimeContextConsumptionHook(DayContext);

export default useTimeToTheDay;
