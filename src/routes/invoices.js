const express = require('express');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment,
  getInvoicePayments
} = require('../controllers/invoiceController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvoices)
  .get(getIvoicesByStatus)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.route('/:id/payments')
  .get(getInvoicePayments)
  .post(addPayment);

module.exports = router;