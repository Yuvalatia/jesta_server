const Job = require("../models/Job");
const User = require("../models/User");
const HttpError = require("../models/HttpError");
const mongoose = require("mongoose");

const getAllJobs = async (req, res, next) => {
  let alljobs;
  try {
    alljobs = await Job.find().sort("-_id");
  } catch {
    return next(new HttpError("cannot pull jobs from server.", 500));
  }
  alljobs = alljobs.map((job) => job.toObject({ getters: true }));
  res.json(alljobs);
};

const getJobById = async (req, res, next) => {
  const jobID = req.params.id;
  let job;
  try {
    job = await Job.findById(jobID);
    if (!job) return next(new HttpError("no job with this id.", 404));
  } catch (err) {
    return next(new HttpError("cannot read job from server.", 500));
  }
  res.json(job.toObject({ getters: true }));
};

const addNewJob = async (req, res, next) => {
  const ownerId = req.userData.id;
  const { description, date, location, payment } = req.body;
  // checks valid props
  if (!description || !date || !location || !payment || !ownerId) {
    return next(new HttpError("one or more details are missing.", 400));
  }
  // chceks if user exsits
  let user;
  try {
    user = await User.findById(ownerId);
  } catch (err) {
    return next(new HttpError("cannot create a job.", 500));
  }
  if (!user) {
    return next(new HttpError("cannot find current user.", 404));
  }

  const job = new Job({
    description,
    date,
    location,
    payment,
    ownerId,
  });

  // Job creation - with session
  let newjob;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    newjob = await job.save({ session: sess });
    user.ownJobs.push(job);
    await user.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("cannot create a job.", 500));
  }
  res.json(newjob);
};

const deleteJob = async (req, res, next) => {
  const ownerId = req.userData.id;
  const jobID = req.body.id;

  let job;
  try {
    job = await Job.findById(jobID).populate("ownerId");
  } catch (err) {
    return next(new HttpError("could not delete palce.", 404));
  }

  //checks if there is a job
  if (!job) {
    return next(new HttpError("job not found.", 404));
  }

  // validate that the job is from this user
  if (job.ownerId._id.toString() !== ownerId) {
    return next(new HttpError("You dont have a premission to delete.", 400));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await job.remove({ session: sess });
    job.ownerId.ownJobs.pull(job);
    await job.ownerId.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("could not delete palce.", 500));
  }

  res.json({ message: "job deleted." });
};

const getJobWatedUsers = async (req, res, next) => {
  const ownerId = req.userData.id;
  const jobID = req.body.id;

  // job exsists
  let job;
  try {
    job = await Job.findById(jobID).populate(
      "intrestedUsers",
      "-password -ownJobs -wantedJobs"
    );
  } catch (err) {
    return next(new HttpError("cannot get job wanted users.", 500));
  }
  if (!job) {
    return next(new HttpError("job dosent found.", 404));
  }
  // job owner is this id
  if (job.ownerId.toString() !== ownerId) {
    return next(new HttpError("cannot get job wanted users.", 400));
  }
  // return usersWanted this job - no password
  res.json({ intrestedUsers: job.intrestedUsers });
};

exports.addNewJob = addNewJob;
exports.getAllJobs = getAllJobs;
exports.getJobById = getJobById;
exports.deleteJob = deleteJob;
exports.getJobWatedUsers = getJobWatedUsers;
