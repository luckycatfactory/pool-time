import { Duration } from '../classes';

const generateDuration = (key, value) =>
  new Duration({
    key,
    value,
  });

export default generateDuration;
