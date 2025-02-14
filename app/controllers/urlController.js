"use strict";

const ApiError = require("../../response/apiError");
const urlModel = require("../models/urlModel");
const redis = require("../../database/redis");

const urlController = {};

urlController.shortenUrl = async function (req, res) {

    try {

        const body = req?.body || {};
        
        const data = {
            long_url: body?.longUrl || '',
            custom_alias: body?.customAlias || '',
            topic: body?.topic || ''
        }

        if (!data?.long_url) {
            return res.status(400).json({ success: false, message: "longUrl is required!" });
        }

        data.user_id = req?.user?.googleId; // Get user from token

        const shortUrl = await urlModel.createShortURL(data);
        
        res.status(200).json({ success: true, shortUrl: `${req?.protocol}://${req.get('host')}${req?.originalUrl}/${shortUrl?.shortUrl}`, shortCode: shortUrl?.shortUrl, createdAt: shortUrl.createdAt });

    } catch (error) {

        if (!(error instanceof ApiError)) {
            console.error("Error Caught AT urlController.shortenUrl : ", error);
            return res.status(500).json({ success: false, message: error.message });
        }

        return res.status(error.code).json({ success: false, message: error?.message });

    }

}


urlController.getLongUrl = async function (req, res) {

    try {

        const data = {
            shortUrl : req?.params?.alias || '',
            userAgent: req?.headers?.["user-agent"] || '',
            ip: req?.connection?.remoteAddress || ''
        }

        if (!data?.shortUrl) {
            return res.status(500).json({ success: false, message: "Invalid URL!" });
        }

        /* Check cache first */
        const cachedUrl = await redis.get(`shortUrl:${data?.shortUrl}`);
        if (cachedUrl) {
            await urlModel.logClick(data);
            return res.redirect(cachedUrl);
        }

        const urlData = await urlModel.logClick(data);

        /* Store in Redis (expires in 1 hour) */
        await redis.set(`shortUrl:${data?.shortUrl}`, urlData?.longUrl, "EX", 3600);

        /* Redirect to the original URL */
        return res.redirect(urlData?.longUrl);

    } catch (error) {

        if (!(error instanceof ApiError)) {
            console.error("Error Caught AT urlController.getLongUrl : ", error);
            return res.status(500).json({ success: false, message: error?.message });
        }

        return res.status(error.code).json({ sucess: false, message: error?.message });

    }

}

urlController.getAnalytics = async function (req, res) {

    try {

        const shortUrl = req?.params?.alias || '';

        if(!shortUrl){
            return res.status(500).json({ success: false, message: "Invalid URL!" });
        }

        const analytics = await urlModel.getAnalytics(shortUrl);
    
        res.status(200).json(analytics);

    } catch (error) {

        if (!(error instanceof ApiError)) {
            console.error("Error Caught AT urlController.getAnalytics : ", error);
            return res.status(500).json({ success: false, message: error.message });
        }

        return res.status(error.code).json({ success: false, message: error?.message });

    }

}

module.exports = urlController;