const User = require("../models/User");
const HttpError = require("../models/HttpError");
const { hash, compare } = require("bcrypt");

const userRegister = async (req, res, next) => {
  let { fullname, image, email, password, birth, phone } = req.body;

  // validation
  let validUser;
  try {
    validUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  // user already exsits
  if (validUser) {
    return next(
      new HttpError("email or phone are already in the system.", 404)
    );
  }

  // hash password
  let hashPassword;
  try {
    hashPassword = await hash(password, 10);
  } catch (err) {
    return next(new HttpError("error made.[ph]", 500));
  }
  // create new user
  let user = new User({
    fullname,
    image,
    email,
    password: hashPassword,
    birth,
    phone,
    ownJobs: [],
    wantedJobs: [],
  });

  let newUser;
  try {
    newUser = await user.save();
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.json(newUser.toObject({ getters: true }));
};
const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("cannot login.", 500));
  }

  if (!user || user.password !== password) {
    return next(new HttpError("email or password are incorrect.", 400));
  }

  res.json({ message: "Login fine!" });
};

exports.userRegister = userRegister;
exports.userLogin = userLogin;
