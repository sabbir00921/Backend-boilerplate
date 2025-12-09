const SSLCommerzPayment = require("sslcommerz-lts");
const { asyncHandaler } = require("../utils/asyncHandaler");
const applicationModel = require("../model/application.model");
const invoiceModel = require("../model/invoice.model");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "development" ? false : true;

// success
exports.success = asyncHandaler(async (req, res) => {
  const { val_id } = req.body;
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const data = await sslcz.validate({
    val_id,
  });

  if (data.status == "VALID" && data.val_id) {
    const application = await applicationModel.findOne({
      transId: data.tran_id,
    });


    // create invoice
    const invoice = await invoiceModel.create({
      invoiceId: data.tran_id,
      amount: data.amount,
      userId: application.userId,
      applicationId: application._id,
    });

    application.paymentStatus = "paid";
    application.invoiceId = invoice._id;

    await application.save();
  }

  res.redirect(
    "https://paystrax.com/wp-content/uploads/2024/07/step-4-1-scaled.jpg"
  );
});

//fail
exports.fail = asyncHandaler(async (req, res) => {
  console.log(req.body);
  const { val_id } = req.body;
  const application = await applicationModel.findOne({
    transId: val_id,
  });

  application.paymentStatus = "failed";
  await application.save();
  res.redirect(
    "https://framerusercontent.com/images/U0VltHCCefV5vWu8znLfThpPx0.png"
  );
});

//cancel
exports.cancel = asyncHandaler(async (req, res) => {
  // console.log(req.body);
  res.redirect(
    "https://docs.klarna.com/static/assets/d55f8323-c2d8-4166-b8dc-1f1ae82cac4c%20In-store%20payment%20canceled%202023-05%2001.jpeg"
  );
});

//ipn
exports.ipn = asyncHandaler(async (req, res) => {
  console.log(req.body);
  res.redirect("https://www.youtube.com/watch?v=fXkh3VufNe8");
});
