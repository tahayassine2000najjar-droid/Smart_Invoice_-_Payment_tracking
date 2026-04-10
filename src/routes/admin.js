const express = require('express');
const {
  getClients,
  getClientSuppliers,
  getClientInvoices,
  getClientPayments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/clients', getClients);
router.get('/clients/:id/suppliers', getClientSuppliers);
router.get('/clients/:id/invoices', getClientInvoices);
router.get('/clients/:id/payments', getClientPayments);

module.exports = router;