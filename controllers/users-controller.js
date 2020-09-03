const User = require("../models/User");
const HttpError = require("../models/HttpError");
const { hash } = require("bcrypt");
const jwt = require("jsonwebtoken");
const Job = require("../models/Job");
const mongoose = require("mongoose");

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

  res.json({ message: "User Created!" });
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

const getUserDetailsByToken = async (req, res, next) => {
  const userId = req.userData.id;

  let user;
  try {
    user = await User.findById(userId, "_id fullname image email birth phone");
  } catch (err) {
    return next(new HttpError("Problem heppend", 500));
  }

  if (!user) {
    return next(new HttpError("No user found.", 404));
  }

  res.json({ user });
};

const getAllUserJobs = async (req, res, next) => {
  const userId = req.userData.id;

  // if users exsits
  let user;
  try {
    user = await User.findById(userId).populate(
      "ownJobs",
      "-ownerId -intrestedUsers"
    );
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

const assignToAJob = async (req, res, next) => {
  const userId = req.userData.id;
  const jobId = req.body.jobId;

  // users exsits
  let user;
  try {
    user = await User.findById(userId, "_id image fullname phone wantedJobs");
  } catch (err) {
    return next(new HttpError("cannot find a user.", 404));
  }
  // job exsits
  let job;
  try {
    job = await Job.findById(jobId);
  } catch (err) {
    return next(new HttpError("cannot find a job.", 404));
  }

  // checks if job is not owned by same user
  if (job.ownerId.toString() === user._id.toString()) {
    return next(new HttpError("user cannot assign to jobs he owned.", 400));
  }
  // check if user already assign to this job
  let alreadyAssign;
  let empty = false;
  try {
    alreadyAssign = await job.intrestedUsers.some((someuser) => {
      empty = true;
      return someuser._id.toString() === user._id.toString();
    });
  } catch (err) {
    return next(new HttpError("cannot assign to a job.", 500));
  }
  if (alreadyAssign && empty) {
    return next(new HttpError("user already assign to this job.", 400));
  }
  // set job intrestedUser & user wantedJobs
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await job.intrestedUsers.push(user);
    await user.wantedJobs.push(job);
    await job.save({ session: sess });
    await user.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("could not assign.", 500));
  }

  res.json({ message: "great job" });
};

exports.userRegister = userRegister;
exports.userLogin = userLogin;
exports.getAllUserJobs = getAllUserJobs;
exports.getAllUserWantedJobs = getAllUserWantedJobs;
exports.assignToAJob = assignToAJob;
exports.getUserDetailsByToken = getUserDetailsByToken;
