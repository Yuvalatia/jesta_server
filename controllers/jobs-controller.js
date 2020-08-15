const Job = require("../models/Job");
const HttpError = require("../models/HttpError");

const getAllJobs = async (req, res, next) => {
  let alljobs;
  try {
    alljobs = await Job.find();
  } catch {
    return next(new HttpError("cannot pull jobs from server.", 500));
  }
  alljobs = alljobs.map((job) => job.toObject({ getters: true }));
  res.json(alljobs);
};

const getJobById = async (req, res, next) => {
  jobID = req.params.id;
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
  const { description, date, location, payment, ownerId } = req.body;
  // checks valid props
  if (!description || !date || !location || !payment || !ownerId) {
    return next(new HttpError("one or more details are missing.", 400));
  }
  const job = new Job({
    description,
    date,
    location,
    payment,
    ownerId,
  });
  let newjob;

  try {
    newjob = await job.save();
  } catch (err) {
    return next(new HttpError("cannot create a job.", 500));
  }
  res.json(newjob);
};

const deleteJob = async (req, res, next) => {
  let jobID = req.params.id;
  let job;

  try {
    job = await Job.findById(jobID);
  } catch (err) {
    return next(new HttpError("could not find the place.", 404));
  }

  try {
    job.remove();
  } catch (err) {
    return next(new HttpError("could not delete palce.", 500));
  }

  res.json({ message: "job deleted." });
};

exports.addNewJob = addNewJob;
exports.getAllJobs = getAllJobs;
exports.getJobById = getJobById;
exports.deleteJob = deleteJob;
