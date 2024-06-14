const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Invalid or expired access token" });

    req.user = user;
    next();
  });
};

module.exports = verifyAccessToken;