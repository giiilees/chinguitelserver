const _ = require("lodash");
const { Collection, validateCollection } = require("../models/collection");
const { Service, validateService } = require("../models/service");
const { Order, validateOrder } = require("../models/order");
const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const Joi = require("joi");
const { forEach } = require("lodash");

router.post("/collection", async (req, res) => {
  const { error } = validateCollection(_.pick(req.body, ["name", "image"]));
  if (error) return res.status(400).send(error.details[0].message);

  let collection = new Collection(_.pick(req.body, ["name", "image"]));

  const result = await collection.save();
  res.send(result);
});

router.post("/collection/get", async (req, res) => {
  let collections = await Collection.find()
    .populate({
      path: "services",
      options: { sort: { _id: -1 } },
    })
    .sort({
      _id: 1,
    });

  const limit = req.body.limit ? req.body.limit : false;
  const skip = req.body.skip ? req.body.skip : 0;

  const allColl = collections
    .reverse()
    .slice(skip, limit ? skip + limit : collections.length);
  res.send(allColl);
});

router.post("/service", async (req, res) => {
  const { error } = validateService(
    _.pick(req.body, ["name", "price", "currency", "description"])
  );
  if (error) return res.status(400).send(error.details[0].message);

  let service = new Service(
    _.pick(req.body, ["name", "price", "currency", "description"])
  );
  const result = await service.save();
  let collection = await Collection.findById(req.body.collection);
  if (!collection) return res.status(400).send("Collection does not exist");
  collection.services.push(result._id);
  const final = await collection.save();

  res.send(final);
});

router.post("/order", auth, async (req, res) => {
  const user = req.user;
  let orders = await Order.find({ user: user._id })
    .populate({
      path: "service",
      options: { sort: { _id: -1 } },
    })

    .sort({
      _id: 1,
    });

  let check = false;
  if (orders) {
    await orders.forEach((item) => {
      if (item.isService & (item.service._id == req.body.service)) {
        check = true;
      }
    });
    if (check) return res.status(400).send("Service déjà actif");
  }

  const { error } = validateOrder({
    isService: req.body.isService,
    user: user._id,
    service: req.body.service,
    amount: req.body.amount,
    currency: req.body.currency,
  });
  if (error) return res.status(400).send(error.details[0].message);

  let order = new Order({
    isService: req.body.isService,
    user: user._id,
    service: req.body.service,
    amount: req.body.amount,
    currency: req.body.currency,
  });
  const result = await order.save();

  res.send(result);
});

router.post("/order/get", async (req, res) => {
  let orders = await Order.find()
    .populate({
      path: "service",
      options: { sort: { _id: -1 } },
    })

    .sort({
      _id: 1,
    });

  const limit = req.body.limit ? req.body.limit : false;
  const skip = req.body.skip ? req.body.skip : 0;

  let allColl = orders
    .reverse()
    .slice(skip, limit ? skip + limit : orders.length);
  res.send(allColl);
});

router.post("/order/get/mine", auth, async (req, res) => {
  const user = req.user;
  let orders = await Order.find({ user: user._id })
    .populate({
      path: "service",
      options: { sort: { _id: -1 } },
    })

    .sort({
      _id: 1,
    });

  const limit = req.body.limit ? req.body.limit : false;
  const skip = req.body.skip ? req.body.skip : 0;

  let allColl = orders
    .reverse()
    .slice(skip, limit ? skip + limit : orders.length);
  res.send(allColl);
});

module.exports = router;
