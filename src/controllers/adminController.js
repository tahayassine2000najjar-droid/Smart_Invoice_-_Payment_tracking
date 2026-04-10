const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');


exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' });
    res.status(200).json({ success: true, count: clients.length, clients });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur lors de la récupération des clients.' });
  }
};


exports.getClientSuppliers = async (req, res) => {
  try {
    const results = await Supplier.find({ user: req.params.id });
    res.status(200).json({ success: true, count: results.length, suppliers: results });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Impossible de trouver les fournisseurs de ce client.' });
  }
};


exports.getClientInvoices = async (req, res) => {
  try {
    const data = await Invoice.find({ user: req.params.id }).populate('supplier', 'name');
    res.status(200).json({ success: true, count: data.length, invoices: data });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur lors de la récupération des factures.' });
  }
};

exports.getClientPayments = async (req, res) => {
  try {
    const history = await Payment.find({ user: req.params.id }).populate('invoice');
    res.status(200).json({ success: true, count: history.length, payments: history });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur lors du chargement des paiements.' });
  }
};