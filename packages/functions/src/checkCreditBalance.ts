export const handler = (input: { cost: number }) => {
  return {
    ...input,
    credits: 100,
  };
};
