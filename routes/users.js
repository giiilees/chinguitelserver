const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const Joi = require("joi");

router.post("/update", auth, async (req, res) => {
  const userDec = req.user;

  if (!req.body.name) return res.status(400).send("No name Provided");

  const DBPAY = await User.findById(userDec._id);
  DBPAY.name = req.body.name;
  const final = await DBPAY.save();

  res.send({
    user: final,
  });
});

router.post("/password/new", auth, async (req, res) => {
  const userDec = req.user;

  const { error } = validatePass(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const DBPAY = await User.findById(userDec._id);

  const validPassword = await bcrypt.compare(req.body.password, DBPAY.password);
  if (!validPassword) return res.status(400).send("Invalid password.");

  if (req.body.password == req.body.new)
    return res.status(400).send("You can't use the same password.");

  const salt = await bcrypt.genSalt(10);
  DBPAY.password = await bcrypt.hash(req.body.new, salt);

  const final = await DBPAY.save();

  const result = _.pick(final, ["isAdmin", "_id", "name", "phone"]);

  res.send({
    success: true,

    user: result,
  });
});

router.post("/", async (req, res) => {
  const { error } = validate(_.pick(req.body, ["name", "phone", "password"]));
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ phone: req.body.phone });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "phone", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  const result = _.pick(user, ["isAdmin", "_id", "name", "phone"]);
  res.send({
    ...result,
    token: token,
  });
});

function validatePass(req) {
  const schema = Joi.object({
    password: Joi.string().min(6).max(255).required(),
    new: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;
