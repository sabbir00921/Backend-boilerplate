const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const ApplicationModel = require("../model/application.model");
const invoiceModel = require("../model/invoice.model");
const { validateApplication } = require("../validation/application.validation");
const { CustomError } = require("../helpers/customError");
const {
  uploadCvCloudinary,
  deleteCvCloudinary,
} = require("../helpers/cloudinary");
const SSLCommerzPayment = require("sslcommerz-lts");
const userModel = require("../model/user.model");

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true;

// create createApplication for job
exports.createApplication = asyncHandaler(async (req, res) => {
  const { value, cv } = await validateApplication(req);

  // Check if already applied
  const isApplied = await ApplicationModel.findOne({
    userId: req.user._id,
    jobId: value.jobId,
  });

  if (isApplied) {
    throw new CustomError(400, "You have already applied for this job");
  }
  const application = await new ApplicationModel({
    ...value,
    userId: req?.user?._id,
  }).save();
  if (!application) throw new CustomError(400, "Application creation failed");

  // find user
  const user = await userModel.findOne({ _id: req?.user?._id || value?.user });
  if (!user) throw new CustomError(400, "User not found");

  // upload cv to cloudinary
  const cvAsset = await uploadCvCloudinary(cv[0]?.path);
  if (!cvAsset) throw new CustomError(500, "CV upload failed");
  application.cvAssets = cvAsset;

  // implement functionalities sslCommerze
  const transId = `INV-${crypto
    .randomUUID()
    .split("-")[0]
    .toLocaleUpperCase()}`;

  const data = {
    total_amount: 100,
    currency: "BDT",
    tran_id: transId,
    success_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/succes`,
    fail_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/fail`,
    cancel_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/cancel`,
    ipn_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/ipn`,
    shipping_method: "NO",
    product_name: "Application Fee.",
    product_category: "Job",
    product_profile: "general",
    cus_name: user.name,
    cus_email: user.email,
    // cus_add1: shippingInfo.address,
    cus_city: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01705080451",
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const sslResponse = await sslcz.init(data);

  application.transId = transId;
  await application.save();

  apiResponse.sendSucess(res, 200, "Application done for job", {
    application,
    url: sslResponse.GatewayPageURL,
  });
});

// get all applications
exports.getAllApplications = asyncHandaler(async (req, res) => {
  const { paymentStatus } = req?.query;
  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  // admin see all & employee see applications posted by this employee
  const pa = req.user.role === "employee" ? { postedBy: req.user._id } : {};
  const applications = await ApplicationModel.find(filter).populate([
    {
      path: "jobId",
      select: "title _id postedBy",
    },
    {
      path: "userId",
      select: "name _id",
    },
  ]);

  // admin see all & employee see applications posted by this employee
  const filtered =
    req.user.role === "employee"
      ? applications.filter(
          (app) => app.jobId?.postedBy?.toString() === req.user._id.toString()
        )
      : applications;

  if (!filtered.length) {
    throw new CustomError(
      404,
      req.user.role === "employee"
        ? "No applications found for your jobs"
        : "No applications found"
    );
  }

  apiResponse.sendSucess(res, 200, "Application list fetched", filtered);
});

// get application by id
exports.getApplicationHistoryById = asyncHandaler(async (req, res) => {
  const userId = req.user._id;
  const application = await ApplicationModel.find({ userId }).populate([
    {
      path: "jobId",
      select: "title _id postedBy",
    },
    {
      path: "userId",
      select: "name _id",
    },
  ]);

  if (application.length === 0)
    throw new CustomError(400, "Application not found");

  apiResponse.sendSucess(res, 200, "Application fetched", application);
});

// accept jobs
exports.acceptJob = asyncHandaler(async (req, res) => {
  const id = req.params.id;

  const application = await ApplicationModel.findById(id).populate(
    "jobId",
    "postedBy"
  );
  if (!application) throw new CustomError(400, "Application not found");

  // admin can accept any application & employee can only accept application posted by this employee
  if (req.user.role !== "admin") {
    if (application.jobId.postedBy.toString() !== req.user._id.toString())
      throw new CustomError(
        400,
        "You are not authorized or post this job to accept"
      );
  }

  if (application.paymentStatus !== "paid")
    throw new CustomError(400, "Application not paid");

  application.status = "accepted";

  await application.save();

  apiResponse.sendSucess(res, 200, "Application accepted", application);
});

// reject jobs
exports.rejectJob = asyncHandaler(async (req, res) => {
  const id = req.params.id;
  const application = await ApplicationModel.findById(id).populate(
    "jobId",
    "postedBy"
  );
  if (!application) throw new CustomError(400, "Application not found");

  // admin can accept any application & employee can only accept application posted by this employee
  if (req.user.role !== "admin") {
    if (application.jobId.postedBy.toString() !== req.user._id.toString())
      throw new CustomError(
        400,
        "You are not authorized or post this job to accept"
      );
  }

  if (application.paymentStatus !== "paid")
    throw new CustomError(400, "Application not paid");

  application.status = "rejected";
  await application.save();
  apiResponse.sendSucess(res, 200, "Application rejected", application);
});

// delete application
exports.deleteApplication = asyncHandaler(async (req, res) => {
  const id = req.params.id;
  const application = await ApplicationModel.findByIdAndDelete(id);
  if (!application) throw new CustomError(400, "Application not found");
  if (application.cvAssets) {
    const deleted = await deleteCvCloudinary(application?.cvAssets?.public_id);
    if (!deleted)
      throw new CustomError(500, "CV delete failed from cloudinary server");
  }

  apiResponse.sendSucess(res, 200, "Application deleted");
});
