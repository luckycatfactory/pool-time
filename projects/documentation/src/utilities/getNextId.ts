let nextId = 1;

const getNextId = (): string => String(nextId++);

export default getNextId;
