"use strict";

const express = require("express");
const urlController = require("../app/controllers/urlController");
const {authenticateJWT} = require("../Middleware/middleware");
const rateLimiter = require("../Middleware/rateLimit");
const router = express.Router();

// Shorten URL Endpoint
router.post("/shorten", authenticateJWT, rateLimiter, urlController.shortenUrl);
router.get("/shorten/:alias?", urlController.getLongUrl);
router.get("/analytics/:alias?", urlController.getAnalytics);

module.exports = router;
