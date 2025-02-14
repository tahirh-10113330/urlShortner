"use strict";

const { getDB } = require("../../database/db");
const ApiError = require("../../response/apiError");


const urlModel = {};

urlModel.createShortURL = function (data) {

	return new Promise(async function (resolve, reject) {

		try {
			
			const db = getDB();
			const urlsCollection = db.collection("urls");
			const { nanoid } = await import("nanoid");

			let shortUrlAlias = data?.custom_alias || nanoid(6); // Use custom alias or generate one

			// Check if alias already exists
			const existing = await urlsCollection.findOne({ shortUrl: shortUrlAlias });
			if (existing) {
				return reject(ApiError.badRequest('Short Url Alias already exists!'));
			}

			const newUrl = {
				longUrl: data?.long_url,
				shortUrl: shortUrlAlias,
				userId: data?.user_id,
				topic: data?.topic || "general",
				createdAt: new Date(),
			};

			const result = await urlsCollection.insertOne(newUrl);

			if (result?.insertedId) {
				return resolve(newUrl);
			}

			return reject(ApiError.errorMessage("Insertion failed"));

		} catch (error) {
			console.error("Error Caught At urlModel.createShortURL :", error);
			return reject(error);
		}

	})

}

urlModel.logClick = function (data) {

	return new Promise(async function (resolve, reject) {

		try {

			const db = getDB();
			const urlsCollection = db.collection("urls");

			const urlData = await urlsCollection.findOne({ shortUrl: data?.shortUrl });
			if (!urlData) return reject(ApiError.notFound("Long URL Not Found!"))

			const osName = data?.userAgent.includes("Windows") ? "Windows" :
				data?.userAgent.includes("Mac") ? "macOS" :
					data?.userAgent.includes("Linux") ? "Linux" :
						data?.userAgent.includes("Android") ? "Android" :
							data?.userAgent.includes("iPhone") ? "iOS" : "Other";

			const deviceType = data?.userAgent.includes("Mobile") ? "Mobile" : "Desktop";

			const today = new Date().toISOString().split("T")[0];

			const updateResult = await urlsCollection.updateOne(
				{ shortUrl: data?.shortUrl },
				{
					$inc: { totalClicks: 1 },
					$addToSet: { uniqueUsers: data?.ip },
					$push: {
						clicksByDate: { date: today, count: 1 },
						osType: { osName, ip: data?.ip },
						deviceType: { deviceName: deviceType, ip: data?.ip },
					},
				}
			);

			return resolve(urlData);

		} catch (error) {
			console.error("Error Caught At urlModel.logClick : ", error);
			return reject(error);
		}

	});

}

urlModel.getAnalytics = function (shortUrl) {

	return new Promise(async function (resolve, reject) {

		try {

			const db = getDB();
			const urlsCollection = db.collection("urls");

			const urlData = await urlsCollection.findOne({ shortUrl });
			if (!urlData) return reject(ApiError.notFound("Short URL not found!"));

			return resolve({
				totalClicks: urlData?.totalClicks || 0,
				uniqueUsers: urlData?.uniqueUsers ? urlData?.uniqueUsers?.length : 0,
				clicksByDate: urlData?.clicksByDate || [],
				osType: urlData?.osType || [],
				deviceType: urlData?.deviceType || [],
			});

		} catch (error) {
			console.error("Error Caught At urlModel.logClick : ", error);
			return reject(error);
		}

	});

}

module.exports = urlModel;
