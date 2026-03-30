const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'agent')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const clientSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  assignedTo: Joi.string().hex().length(24).allow('', null)
});

const invoiceSchema = Joi.object({
  client: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  dueDate: Joi.date().required(),
  status: Joi.string().valid('unpaid', 'paid', 'overdue')
});

const paymentSchema = Joi.object({
  invoice: Joi.string().hex().length(24).required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('cash', 'bank transfer', 'cheque').required(),
  date: Joi.date().optional()
});

// For PUT /payments/:id — only amount and method can be updated, invoice is NOT sent
const paymentUpdateSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  method: Joi.string().valid('cash', 'bank transfer', 'cheque').optional(),
  date: Joi.date().optional()
});

const recoverySchema = Joi.object({
  invoice: Joi.string().hex().length(24).required(),
  actionType: Joi.string().valid('email', 'sms').required(),
  description: Joi.string().allow('', null),
  date: Joi.date().optional()
});

module.exports = {
  userSchema,
  loginSchema,
  clientSchema,
  invoiceSchema,
  paymentSchema,
  paymentUpdateSchema,
  recoverySchema
};
