const express = require("express");
const router = express.Router();

const marketController = require("../controllers/marketController");

router.get("/market", marketController.marketHome);

router.get("/sell-item", marketController.sellPage);

router.post("/sell-item", marketController.sellItem);
router.post("/delete-item/:id", async (req, res) => {

const item = await Item.findById(req.params.id);

if(!item) return res.redirect("/market");

/* check if logged user is owner */

if(item.userId.toString() !== req.user._id.toString()){
return res.redirect("/market");
}

await Item.findByIdAndDelete(req.params.id);

res.redirect("/market");

});

module.exports = router;