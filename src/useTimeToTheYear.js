import YearContext from './TimeProvider/YearContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheYear = generateTimeContextConsumptionHook(YearContext);

export default useTimeToTheYear;
