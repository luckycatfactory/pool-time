const validateArrayInAscendingOrder = (selector, errorClass, errorMessage) => entities => {
  for (let i = 0; i < entities.length - 1; i++) {
    const currentEntity = entities[i];
    const nextEntity = entities[i + 1];

    if (selector(currentEntity) > selector(nextEntity)) {
      throw new errorClass(errorMessage);
    }
  }
};

export default validateArrayInAscendingOrder;
