const mongoose = require("mongoose");

const marketItemSchema = new mongoose.Schema({

title: {
type: String,
required: true
},

category: String,

price: {
type: Number,
required: true
},

condition: String,

description: String,

images: [String],

seller: {
type: mongoose.Schema.Types.ObjectId,
ref: "User"
},

sellerName: String,

status: {
type: String,
default: "available"
},

createdAt: {
type: Date,
default: Date.now
}

});

module.exports = mongoose.model("MarketItem", marketItemSchema);