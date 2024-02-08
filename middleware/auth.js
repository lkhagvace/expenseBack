const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  try {
    const refreshToken =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!refreshToken) {
      res.status(401).json({ message: "unauthorized" });
    }
    const decoded = jwt.verify(refreshToken, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("error: ", error);
    return res.status(403).json({ message: "invalid" });
  }
};
module.exports = { verifyToken };
