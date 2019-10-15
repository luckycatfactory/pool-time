import generateDurationObject from '../generateDurationObject';

describe('generateDurationObject()', () => {
  it('returns an object of the correct shape', () => {
    const mockKey = 'oneMillenium';
    const mockValue = 1000 * 60 * 60 * 24 * 365 * 1000;
    const durationObject = generateDurationObject(mockKey, mockValue);
    expect(durationObject).toEqual({ context: expect.any(Object), key: mockKey, value: mockValue });
  });
});
