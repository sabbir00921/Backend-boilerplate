const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const invoiceModel = require("../model/invoice.model");
const { CustomError } = require("../helpers/customError");
const applicationModel = require("../model/application.model");

// get getallInvoice
exports.getallInvoice = asyncHandaler(async (req, res) => {
  const invoice = await invoiceModel.find();
  if (!invoice) throw new CustomError(404, "Invoice not found");
  apiResponse.sendSucess(res, 200, "Invoice list fetched", invoice);
});

// get single invoice by trans id
exports.getInvoiceById = asyncHandaler(async (req, res) => {
  const { transId } = req.params;

  if (!transId) throw new CustomError(400, "transId is required");

  // dynamic query
  const query = {
    invoiceId: transId,
    ...(req.user.role === "job_seeker" && { userId: req.user._id }),
  };

  console.log(query);

  const invoice = await invoiceModel
    .findOne(query)
    .populate("userId", "name email")
    .populate({
      path: "applicationId",
      populate: {
        path: "jobId",
      },
    });
  // .populate("jobId");

  if (!invoice) throw new CustomError(404, "Invoice not found");

  return apiResponse.sendSucess(res, 200, "Invoice fetched", invoice);
});

// delete invoice
exports.deleteInvoice = asyncHandaler(async (req, res) => {
  const { transId } = req.params;
  if (!transId) throw new CustomError(400, "transId is required");

  const invoice = await invoiceModel.findOneAndDelete({ invoiceId: transId });
  if (!invoice) throw new CustomError(400, "Invoice not found");

  apiResponse.sendSucess(res, 200, "Invoice deleted");
});
