module.exports = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    } finally {
      if (req.dbConnection) {
        req.dbConnection.release();
      }
    }
  };
};
