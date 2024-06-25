const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    process.env.JWT_ACCESS_SECRET_KEY,
    {
      expiresIn: "15m",
    }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    process.env.JWT_REFRESH_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
