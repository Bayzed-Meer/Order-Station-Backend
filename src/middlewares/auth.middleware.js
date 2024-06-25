const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY, (err, user) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError)
        return res.status(401).json({ message: "TokenExpiredError" });

      return res.status(403).json({ message: "Invalid access token" });
    }

    req.user = user;
    next();
  });
};

const verifyRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) next();
    else res.status(403).json({ message: "Access forbidden" });
  };
};

const verifyAdmin = [verifyAccessToken, verifyRole("admin")];
const verifyEmployee = [verifyAccessToken, verifyRole("employee")];
const verifyStaff = [verifyAccessToken, verifyRole("staff")];

module.exports = {
  verifyAccessToken,
  verifyAdmin,
  verifyEmployee,
  verifyStaff,
};
