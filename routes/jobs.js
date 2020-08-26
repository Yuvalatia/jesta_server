const express = require("express");
const router = express.Router();

const jobControllers = require("../controllers/jobs-controller");
const tokenValidation = require("../auth/auth-check");

router.get("/", jobControllers.getAllJobs);
router.get("/:id", jobControllers.getJobById);
router.post("/", tokenValidation, jobControllers.addNewJob);
router.delete("/", tokenValidation, jobControllers.deleteJob);

module.exports = router;
