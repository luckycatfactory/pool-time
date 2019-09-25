import MonthContext from './TimeProviders/MonthContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheDay = generateTimeContextConsumptionHook(MonthContext);

export default useTimeToTheDay;
