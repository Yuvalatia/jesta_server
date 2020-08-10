const express = require("express");
const mongoose = require("mongoose");
const jobsRoute = require("./routes/jobs");
const usersRoute = require("./routes/users");
require("dotenv").config();
const app = express();

// Body Parser
app.use(express.json());

// Routes
app.use("/jobs", jobsRoute);
app.use("/users", usersRoute);

// Error handler
app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500).json({ message: err.message || "unknown error" });
});

// Connection to DB
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() =>
    app.listen(port, () => console.log(`Server Port: ${port} - DB connected`))
  )
  .catch((err) => console.log(err));
