const express = require("express");
const router = express.Router();

const jobControllers = require("../controllers/jobs-controller");

router.get("/", jobControllers.getAllJobs);
router.get("/:id", jobControllers.getJobById);
router.post("/", jobControllers.addNewJob);

module.exports = router;
