const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: null,
      });
    }

    return next();
  };
};

export default authorize;
