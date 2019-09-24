import { useContext } from 'react';
import MinuteContext from './TimeProvider/MinuteContext';
import { generateTimeContextConsumptionHook } from './utilities';

const useTimeToTheMinute = generateTimeContextConsumptionHook(MinuteContext);

export default useTimeToTheMinute;
