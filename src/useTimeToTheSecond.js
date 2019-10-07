import SecondContext from './TimeProviders/SecondContext';
import { generateTimeContextConsumptionHook } from './TimeProviders/utilities';

const useTimeToTheSecond = generateTimeContextConsumptionHook(SecondContext);

export default useTimeToTheSecond;
