const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: 'Supplier',
    required: [true, 'Please add a supplier']
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
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

InvoiceSchema.pre('save', function(next) {
  if (this.totalPaid === 0) {
    this.status = 'unpaid';
  } else if (this.totalPaid < this.amount) {
    this.status = 'partially_paid';
  } else if (this.totalPaid >= this.amount) {
    this.status = 'paid';
  }

  this.remainingAmount = this.amount - this.totalPaid;
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);



