const MarketItem = require("../models/marketItem");

/* Marketplace Home */

exports.marketHome = async (req,res)=>{

const items = await MarketItem.find()
.sort({createdAt:-1});

res.render("market/home",{items});

};


/* Sell Page */

exports.sellPage = (req,res)=>{

res.render("market/sell");

};


/* Upload Item */

exports.sellItem = async (req,res)=>{

const images = req.files.map(f => f.path);

await MarketItem.create({

title:req.body.title,
category:req.body.category,
price:req.body.price,
condition:req.body.condition,
description:req.body.description,
images,

seller:req.user.id,
sellerName:req.user.displayName

});

res.redirect("/market");

};