import DayContext from './TimeProviders/DayContext';
import { generateTimeContextConsumptionHook } from './TimeProviders/utilities';

const useTimeToTheDay = generateTimeContextConsumptionHook(DayContext);

export default useTimeToTheDay;
