import YearContext from './TimeProviders/YearContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheYear = generateTimeContextConsumptionHook(YearContext);

export default useTimeToTheYear;
