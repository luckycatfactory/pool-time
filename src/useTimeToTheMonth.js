import MonthContext from './TimeProviders/MonthContext';
import { generateTimeContextConsumptionHook } from './TimeProviders/utilities';

const useTimeToTheDay = generateTimeContextConsumptionHook(MonthContext);

export default useTimeToTheDay;
