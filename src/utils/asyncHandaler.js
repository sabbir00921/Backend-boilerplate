exports.asyncHandaler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      // console.log("Error from async handaler function",error);
      next(error);
    }
  };
};
