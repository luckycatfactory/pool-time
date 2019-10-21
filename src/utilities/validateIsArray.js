const validateIsArray = (errorClass, errorMessage) => entities => {
  if (!Array.isArray(entities)) {
    throw new errorClass(errorMessage);
  }
};

export default validateIsArray;
