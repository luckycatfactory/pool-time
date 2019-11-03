const validateIsArrayOf = (type, errorClass, errorMessage) => entities => {
  entities.forEach(entity => {
    if (!(entity instanceof type)) {
      throw new errorClass(errorMessage);
    }
  });
};

export default validateIsArrayOf;
