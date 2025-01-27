export const validateWCAId = (id: string) => {
  const regex = /^\d{4}[A-Za-z]{4}\d{2}$/;
  return regex.test(id)
    ? null
    : "Invalid WCA ID format. Use 4 digits, 4 letters, and 2 digits.";
};
