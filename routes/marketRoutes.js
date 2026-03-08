const express = require("express");
const router = express.Router();

const marketController = require("../controllers/marketController");

router.get("/market", marketController.marketHome);

router.get("/sell-item", marketController.sellPage);

router.post("/sell-item", marketController.sellItem);

module.exports = router;