const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const User = new mongoose.Schema({
  fullname: { type: String, maxlength: 30, minlength: 4, required: true },
  image: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, minlength: 6, required: true },
  birth: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  ownJobs: [{ type: mongoose.Types.ObjectId, required: true, ref: "Jobs" }],
  wantedJobs: [{ type: mongoose.Types.ObjectId, required: true, ref: "Jobs" }],
});

User.plugin(uniqueValidator);

module.exports = mongoose.model("Users", User);
