export const calculateTealGradient = (value: number) => {
  const clampedValue = Math.min(Math.max(value, 0), 1);
  const lightness = 100 - clampedValue * 100;
  return `hsl(162, 60%, ${lightness}%)`;
};

export const getTextColor = (value: number) => {
  const clampedValue = Math.min(Math.max(value, 0), 1);
  const lightness = 100 - clampedValue * 100;
  return lightness < 50 ? "white" : "black";
};
