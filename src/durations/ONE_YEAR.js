import { generateDurationObject } from '../utilities';

// For our purposes, a year is currently 365 days.
const ONE_YEAR = generateDurationObject('oneYear', 31536000000);

export default ONE_YEAR;
