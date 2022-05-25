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
  image: {
    type: String,
  },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  created: {
    type: Date,
    default: Date.now(),
  },
});

const Collection = mongoose.model("Collection", serviceSchema);

function validateCollection(collection) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    image: Joi.string().allow("").required(),
  });

  return schema.validate(collection);
}

exports.Collection = Collection;
exports.validateCollection = validateCollection;
