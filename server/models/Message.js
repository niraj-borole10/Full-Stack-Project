const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
{
    roomId: String,
    sender: String,
    message: String,
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Message", messageSchema);