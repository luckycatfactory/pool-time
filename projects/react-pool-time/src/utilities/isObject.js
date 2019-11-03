const isObject = item => typeof item === 'object' && item !== null && !Array.isArray(item);

export default isObject;
