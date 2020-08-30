const User = require("../models/User");
const HttpError = require("../models/HttpError");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");

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

  if (!user) {
    return next(new HttpError("email or password are wrong.", 404));
  }

  // password unhash
  let isTruePassword;
  try {
    isTruePassword = await hash(password, user.password);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }
  if (!isTruePassword) {
    return next(new HttpError("email or password are wrong.", 404));
  }

  // token creation
  let token;
  try {
    token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  } catch (err) {
    return next(new HttpError("cannot login.", 500));
  }
  res.json({ email: user.email, token: token });
};

const getAllUserJobs = async (req, res, next) => {
  const userId = req.userData.id;

  // if users exsits
  let user;
  try {
    user = await User.findById(userId).populate("ownJobs", "-ownerId");
  } catch (err) {
    return next(new HttpError("user not found.", 404));
  }

  res.json({ ownJobs: user.ownJobs });
};

const getAllUserWantedJobs = async (req, res, next) => {
  const userId = req.userData.id;

  // if users exsits
  let user;
  try {
    user = await User.findById(userId).populate(
      "wantedJobs",
      "-intrestedUsers"
    );
  } catch (err) {
    return next(new HttpError("user not found.", 404));
  }

  res.json({ wantedJobs: user.wantedJobs });
};

exports.userRegister = userRegister;
exports.userLogin = userLogin;
exports.getAllUserJobs = getAllUserJobs;
exports.getAllUserWantedJobs = getAllUserWantedJobs;
