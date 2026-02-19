export const formatValidationErrors = (error) => {
  if (!error || error.name !== "ValidationError") {
    return null;
  }
  return Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));
};

export const isDuplicateKeyError = (error) => {
  return error && error.code === 11000;
};
