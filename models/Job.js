const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  description: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  payment: { type: Number, required: true },
  ownerId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  intrestedUsers: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  ],
});

module.exports = mongoose.model("Jobs", JobSchema);
