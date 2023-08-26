const express = require("express");
const {
  createNewShortUrl,
  showShortUrlsOfUser,
  getUrlByUrlCode,
  deleteShortUrl,
} = require("../src/controller/urlController");
const router = express.Router();

// Create short URL
router.post("/", createNewShortUrl);

//Read All URLs
router.get("/", showShortUrlsOfUser);

//Redirect URLs
router.get("/:urlCode", getUrlByUrlCode);

//Delete URLs short url
router.delete("/:id", deleteShortUrl);

module.exports = router;
