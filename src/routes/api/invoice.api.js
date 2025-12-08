const express = require("express");
const router = express.Router();
const invoiceController = require("../../controller/invoice.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { permission } = require("../../middleware/permission.middleware");

router
  .route("/getall-invoice")
  .get(
    authGuard,
    permission(["admin"], ["view"]),
    invoiceController.getallInvoice
  );
router
  .route("/get-singleinvoice/:transId")
  .get(
    authGuard,
    permission(["admin", "job_seeker"], ["view"]),
    invoiceController.getInvoiceById
  );

router
  .route("/delete-invoice/:transId")
  .delete(
    authGuard,
    permission(["admin"], ["delete"]),
    invoiceController.deleteInvoice
  );

module.exports = router;
