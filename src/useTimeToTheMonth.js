import MonthContext from './TimeProvider/MonthContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheDay = generateTimeContextConsumptionHook(MonthContext);

export default useTimeToTheDay;
