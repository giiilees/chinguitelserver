const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/validate", async (req, res) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    const result = await User.findById(decoded._id);

    res.send({
      token: token,
      user: _.pick(result, ["isAdmin", "_id", "name", "phone"]),
    });
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const Phone = req.body.phone;

  let user = await User.findOne({ phone: Phone });
  if (!user) return res.status(400).send("Invalid phone or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send({
    token: token,
    user: _.pick(user, ["_id", "name", "phone", "isAdmin"]),
  });
});

function validate(req) {
  const schema = Joi.object({
    phone: Joi.number().required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;
