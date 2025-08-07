export const getNowWIB = (): Date => {
  return new Date(Date.now() + 7 * 60 * 60 * 1000);
};