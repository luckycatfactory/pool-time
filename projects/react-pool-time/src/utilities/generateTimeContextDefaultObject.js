const generateTimeContextDefaultObject = duration => ({
  duration,
  registerConsumer: () => {},
  time: Date.now(),
  unregisterConsumer: () => {},
});

export default generateTimeContextDefaultObject;
