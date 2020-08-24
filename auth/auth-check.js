const jwt = require("jsonwebtoken");
const HttpError = require("../models/HttpError");

const tokenValidation = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // no bearer
    if (!token) {
      throw new Error();
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { id: decodedToken.id };
    next();
  } catch (err) {
    return next(new HttpError("Auth failed.", 401));
  }
};

module.exports = tokenValidation;
