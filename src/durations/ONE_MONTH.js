import { generateDurationObject } from '../utilities';

// For our purposes, a month is currently 30 days.
const ONE_MONTH = generateDurationObject('oneMonth', 2592000000);

export default ONE_MONTH;
