const Invoice = require('../models/Invoice');
const Supplier = require('../models/Supplier');
const Payment = require('../models/Payment');
const { invoiceSchema, paymentSchema } = require('../utils/validation');

exports.getInvoices = async (req, res) => {
  try {
    const { status, supplierId } = req.query;
    let filters = { user: req.user.id };

    if (status) filters.status = status;
    if (supplierId) filters.supplier = supplierId;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(filters)
      .populate('supplier', 'name')
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: invoices.length,
      pagination: { total, page, limit },
      invoices
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur lors du chargement des factures.' });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('supplier', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée.' });
    }

   
    if (invoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Accès non autorisé.' });
    }

    res.status(200).json({ success: true, invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { error } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const { supplierId, amount, dueDate, description } = req.body;

   
    const checkSupplier = await Supplier.findById(supplierId);
    if (!checkSupplier || checkSupplier.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Le fournisseur sélectionné est invalide.' });
    }

    const newInvoice = await Invoice.create({
      supplier: supplierId,
      user: req.user.id,
      amount,
      dueDate,
      description
    });

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (err) {
    res.status(400).json({ success: false, message: "Impossible de créer la facture." });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { error } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    let findInvoice = await Invoice.findById(req.params.id);

    if (!findInvoice) {
      return res.status(404).json({ success: false, message: 'Facture inexistante.' });
    }

    if (findInvoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Action non autorisée.' });
    }

  
    if (findInvoice.status === 'paid') {
      return res.status(422).json({ success: false, message: 'Impossible de modifier une facture déjà réglée.' });
    }

    findInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, invoice: findInvoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoiceToDelete = await Invoice.findById(req.params.id);

    if (!invoiceToDelete) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée.' });
    }

    if (invoiceToDelete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Action interdite.' });
    }


    const paymentsExist = await Payment.countDocuments({ invoice: req.params.id });
    if (paymentsExist > 0) {
      return res.status(422).json({ success: false, message: 'Suppression impossible car des paiements y sont liés.' });
    }

    await invoiceToDelete.deleteOne();

    res.status(200).json({ success: true, message: 'La facture a été supprimée.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.addPayment = async (req, res) => {
  try {
    const { error } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const { amount, paymentDate, mode_paiement, note } = req.body;
    let targetInvoice = await Invoice.findById(req.params.id);

    if (!targetInvoice) {
      return res.status(404).json({ success: false, message: 'Facture introuvable.' });
    }

    if (targetInvoice.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé.' });
    }

    if (targetInvoice.status === 'paid') {
      return res.status(422).json({ success: false, message: 'Cette facture est déjà payée.' });
    }


    if (targetInvoice.totalPaid + amount > targetInvoice.amount) {
      return res.status(422).json({ success: false, message: 'Le montant total des paiements ne peut pas dépasser le montant de la facture.' });
    }

    const newPayment = await Payment.create({
      invoice: req.params.id,
      user: req.user.id,
      amount,
      paymentDate,
      mode_paiement,
      note
    });


    targetInvoice.totalPaid += amount;
    await targetInvoice.save();

    res.status(201).json({ success: true, payment: newPayment });
  } catch (err) {
    console.error('Payment Error:', err);
    res.status(400).json({ success: false, message: "Erreur lors de l'enregistrement du paiement." });
  }
};

exports.getInvoicePayments = async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);

    if (!inv) {
      return res.status(404).json({ success: false, message: 'Facture introuvable.' });
    }

    if (inv.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Non autorisé.' });
    }

    const history = await Payment.find({ invoice: req.params.id });

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};