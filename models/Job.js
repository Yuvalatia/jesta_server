const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  description: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  payment: { type: Number, required: true },
  ownerId: { type: String, required: true },
});

module.exports = mongoose.model("Jobs", JobSchema);
