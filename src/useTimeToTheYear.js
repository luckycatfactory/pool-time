import YearContext from './TimeProviders/YearContext';
import { generateTimeContextConsumptionHook } from './TimeProviders/utilities';

const useTimeToTheYear = generateTimeContextConsumptionHook(YearContext);

export default useTimeToTheYear;
