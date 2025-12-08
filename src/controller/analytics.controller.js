const ApplicationModel = require("../model/application.model");
const UserModel = require("../model/user.model");
const JobModel = require("../model/job.model");

exports.getAnalytics = async (req, res) => {
  const totalUsers = await UserModel.countDocuments();
  const totalJobs = await JobModel.countDocuments();
  const totalApplications = await ApplicationModel.countDocuments();

  const applicationsPerJob = await ApplicationModel.aggregate([
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);

  const applicationsPerUser = await ApplicationModel.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);

  const paidApplications = await ApplicationModel.countDocuments({ paymentStatus: "paid" });

  res.status(200).json({
    totalUsers,
    totalJobs,
    totalApplications,
    applicationsPerJob,
    applicationsPerUser,
    paidApplications,
  });
};
