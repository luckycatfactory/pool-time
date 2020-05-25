const roundTimeToSecond = (time: number): number =>
  Math.round(time / 1000) * 1000;

export default roundTimeToSecond;
