const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  password_confirmation: Joi.ref("password"),
  role: Joi.string().valid("client", "admin").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const supplierSchema = Joi.object({
  name: Joi.string().min(2).required(),
  contact: Joi.string().allow("", null),
  email: Joi.string().email().allow("", null),
  phone: Joi.string().allow("", null),
  address: Joi.string().allow("", null),
});

const invoiceSchema = Joi.object({
  supplierId: Joi.string().required(),
  amount: Joi.number().greater(0).required(),
  dueDate: Joi.date().required(),
  description: Joi.string().allow("", null),
});

const paymentSchema = Joi.object({
  amount: Joi.number().greater(0).required(),
  paymentDate: Joi.date().max("now").required(),
  mode_paiement: Joi.string().valid("espèces", "chèque", "virement").required(),
  note: Joi.string().allow("", null),
});

module.exports = {
  registerSchema,
  loginSchema,
  supplierSchema,
  invoiceSchema,
  paymentSchema,
};
