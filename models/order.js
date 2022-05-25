const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  isService: {
    type: Boolean,
    default: true,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
  },
  status: {
    type: String,
    default: "processing",
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model("Order", serviceSchema);

function validateOrder(order) {
  const schema = Joi.object({
    isService: Joi.boolean().required(),
    user: Joi.string().allow(""),
    service: Joi.string().allow("", null),
    amount: Joi.number().allow(""),
    currency: Joi.string().allow(""),
  });

  return schema.validate(order);
}

exports.Order = Order;
exports.validateOrder = validateOrder;
