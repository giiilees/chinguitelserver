const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

const Service = mongoose.model("Service", serviceSchema);

function validateService(service) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().required(),
    currency: Joi.string().required(),
    description: Joi.string().min(5).max(255),
  });

  return schema.validate(service);
}

exports.Service = Service;
exports.validateService = validateService;
