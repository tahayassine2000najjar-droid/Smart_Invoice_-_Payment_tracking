const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.ObjectId,
    ref: 'Invoice',
    required: [true, 'Please add an invoice']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  paymentDate: {
    type: Date,
    required: [true, 'Please add a payment date'],
    default: Date.now
  },
  mode_paiement: {
    type: String,
    required: [true, 'Please add a payment mode'],
    enum: ['espèces', 'chèque', 'virement']
  },
  note: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);