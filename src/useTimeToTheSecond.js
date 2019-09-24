import { useContext } from 'react';
import SecondContext from './TimeProvider/SecondContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheSecond = generateTimeContextConsumptionHook(SecondContext);

export default useTimeToTheSecond;
