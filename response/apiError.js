/**
 * This is API Error Handler to send appropriate status codes when request being rejected from MODEL.
 */

class ApiError
{
    constructor(code, message, loggerObj = false, errorCode = 1, options = {}) {
        this.code = code;
        this.errorCode = errorCode;
        this.message = message;
        if (loggerObj)
            this.loggerObj = loggerObj;

        if (options?.root__layer__response) {
            this.root__layer__response = options?.root__layer__response
        }
        if (options?.data) { // This goes under results node in error state.
            this.data = options?.data
        }
    }

    static errorMessage(message, logObj, errorCode = 1, options = {}) {
        return new ApiError(200, message, logObj, errorCode, options);
    }

    static unAuthorized(message, logObj = false, errorCode = 1, options = {}) {
        return new ApiError(401, message, logObj, errorCode, options);
    }

    static badRequest(message, logObj = false, errorCode = 1, options = {}) {
        return new ApiError(400, message, logObj, errorCode, options);
    }

    static internalError(message, logObj, errorCode = 1, options = {}) {
        return new ApiError(500, message, logObj, errorCode, options);
    }

    static notFound(message, logObj, errorCode = 1, options = {}) {
        return new ApiError(404, message, logObj, errorCode, options);
    }
}

module.exports = ApiError;