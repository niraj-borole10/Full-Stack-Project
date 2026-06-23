const express = require("express");
const router = express.Router();
const {
    explainCode,
    reviewCode,
    autocompleteCode
} = require("../controllers/aiController");

router.post("/explain", explainCode);
router.post("/review", reviewCode);
router.post("/autocomplete", autocompleteCode);

module.exports = router;
