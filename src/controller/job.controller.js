const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const jobModel = require("../model/job.model");
const { CustomError } = require("../helpers/customError");
const { validateJobCreate } = require("../validation/job.validation");

// create job
exports.createJob = asyncHandaler(async (req, res) => {
  const value = await validateJobCreate(req);
  const job = await new jobModel({ ...value, postedBy: req.user._id }).save();
  if (!job) throw new CustomError(400, "Job creation failed");

  apiResponse.sendSucess(res, 200, "Job created successfully", job);
});

// get all jobs
exports.getAllJobs = asyncHandaler(async (req, res) => {
  const { company } = req.query;

  // create pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (company) filter.company = company;

  const jobs = await jobModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .populate("postedBy", "name");
  if (!jobs.length) throw new CustomError(404, "No jobs found");
  apiResponse.sendSucess(res, 200, "Job list fetched", jobs);
});

// get job by id
exports.getJobById = asyncHandaler(async (req, res) => {
  const id = req.params.id;
  const job = await jobModel.findById(id).populate("postedBy", "name _id");
  if (!job) throw new CustomError(404, "Job not found");
  apiResponse.sendSucess(res, 200, "Job fetched", job);
});

// update job
exports.updateJob = asyncHandaler(async (req, res) => {
  const id = req.params.id;
  const value = req?.body;

  if (value?.company) throw new CustomError(400, "Can't update company name");

  if (!value)
    throw new CustomError(400, "Value are missing for update job details");
  const job = await jobModel
    .findOne({ _id: id })
    .populate("postedBy", "name role _id");

  if (!job) throw new CustomError(404, "Job not found");
  if (req?.user?.role === "admin") {
    job.title = value?.title || job.title;
    job.description = value?.description || job.description;
    job.company = value?.company || job.company;
    job.location = value?.location || job.location;
    job.salaryRange = value?.salaryRange || job.salaryRange;
    await job.save();
    apiResponse.sendSucess(res, 200, "Job updated successfully", job);
    return;
  }

  if (job.postedBy._id.toString() != req.user._id.toString())
    throw new CustomError(
      400,
      "Unauthorized for update this job or you not posted this job"
    );
  job.title = value?.title || job.title;
  job.description = value?.description || job.description;
  job.company = value?.company || job.company;
  job.location = value?.location || job.location;
  job.salaryRange = value?.salaryRange || job.salaryRange;
  await job.save();
  apiResponse.sendSucess(res, 200, "Job updated successfully", job);
});

// delete job
exports.deleteJob = asyncHandaler(async (req, res) => {
  const id = req.params.id;
  const job = await jobModel
    .findOne({ _id: id })
    .populate("postedBy", "name role _id");
  if (!job) throw new CustomError(404, "Job not found");

  if (job.postedBy.role === "admin") {
    const DeletedJob = await jobModel.findOneAndDelete({ _id: id });
    apiResponse.sendSucess(res, 200, "Job deleted successfully", DeletedJob);
    return;
  }
  if (job.postedBy._id.toString() !== req.user._id.toString())
    throw new CustomError(403, "Unauthorized for delete this job or you not posted this job");

  const DeletedJob = await jobModel.findOneAndDelete({ _id: id });
  apiResponse.sendSucess(res, 200, "Job deleted successfully", DeletedJob);
});
