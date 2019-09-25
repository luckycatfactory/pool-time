import SecondContext from './TimeProviders/SecondContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheSecond = generateTimeContextConsumptionHook(SecondContext);

export default useTimeToTheSecond;
