import DayContext from './TimeProviders/DayContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheDay = generateTimeContextConsumptionHook(DayContext);

export default useTimeToTheDay;
