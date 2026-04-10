const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Supplier = require('../models/Supplier');


exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

   
    const totalSuppliers = await Supplier.countDocuments({ user: userId });
    const totalInvoices = await Invoice.countDocuments({ user: userId });

    const invoices = await Invoice.find({ user: userId });
    
    let totalAmount = 0;
    let totalPaid = 0;

    invoices.forEach(inv => {
      totalAmount += inv.amount;
      totalPaid += inv.totalPaid;
    });

    
    const statusStats = await Invoice.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

  
    const topSuppliers = await Invoice.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$supplier',
          totalExpense: { $sum: '$amount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { totalExpense: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'details'
        }
      },
      { $unwind: '$details' },
      {
        $project: {
          name: '$details.name',
          totalExpense: 1,
          invoiceCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        suppliersCount: totalSuppliers,
        invoicesCount: totalInvoices,
        totalAmount,
        totalPaid,
        balance: totalAmount - totalPaid
      },
      statusDistribution: statusStats,
      spendingBySupplier: topSuppliers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques.' });
  }
};


exports.getSupplierStats = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const userId = req.user.id;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier || (supplier.user.toString() !== userId && req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Fournisseur introuvable.' });
    }

    const invoices = await Invoice.find({ supplier: supplierId });

    let totalAmount = 0;
    let totalPaid = 0;

    invoices.forEach(inv => {
      totalAmount += inv.amount;
      totalPaid += inv.totalPaid;
    });

    
    const globalTotalStats = await Invoice.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const globalTotal = globalTotalStats.length > 0 ? globalTotalStats[0].total : 0;
    const shareOfSpending = globalTotal > 0 ? (totalAmount / globalTotal) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        name: supplier.name,
        invoiceCount: invoices.length,
        totalAmount,
        totalPaid,
        remaining: totalAmount - totalPaid,
        shareOfSpending: shareOfSpending.toFixed(2) + '%'
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Erreur lors de la récupération des données.' });
  }
};