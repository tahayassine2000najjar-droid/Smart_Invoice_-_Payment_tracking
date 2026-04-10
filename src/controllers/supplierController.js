const Supplier = require('../models/Supplier');
 const Invoice = require('../models/Invoice');
const { supplierSchema } = require('../utils/validation');


exports.getSuppliers = async (req, res) => {
  try {
    const { name } = req.query;
 
    let filter = { user: req.user.id };
   
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const suppliers = await Supplier.find(filter)
      .skip(offset)
      .limit(limit);

    const totalCount = await Supplier.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      pagination: {
        total: totalCount,
        page,
        limit
      },
      suppliers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des fournisseurs.' });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const result = await Supplier.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé.' });
    }

    if (result.user.toString() !== req.user.id && req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    
    const invoices = await Invoice.countDocuments({ supplier: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...result._doc,
        invoicesCount: invoices
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'ID invalide.' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { error } = supplierSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

  
    const newSupplier = new Supplier({
      ...req.body,
      user: req.user.id
    });

    await newSupplier.save();

    res.status(201).json({
      success: true,
      supplier: newSupplier
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Impossible de créer le fournisseur.' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { error } = supplierSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    let sup = await Supplier.findById(req.params.id);

    if (!sup) {
      return res.status(404).json({ success: false, message: 'Fournisseur introuvable.' });
    }

    if (sup.user.toString() !== req.user.id && req.user.role !== 'client') {
      return res.status(401).json({ success: false, message: 'Action non autorisée.' });
    }

    sup = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      supplier: sup
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const target = await Supplier.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé.' });
    }

    if (target.user.toString() !== req.user.id && req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Permission refusée.' });
    }


    await target.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fournisseur supprimé avec succès.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};