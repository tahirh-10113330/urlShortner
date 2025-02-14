/**
 * This is API Succes Handler to send appropriate status codes when API sends a success reponse.
 */


const statusCodes = {
    bad_request : 400,
    unauthorized: 401,
    forbidden   : 403,
    not_found   : 404,
    server_error: 500,
    ok          : 200,
    created     : 201,
    accepted    : 202
};

class ApiSuccess
{
    constructor(data, message = '', code = 200, errorCode = 0, loggerObj = false) {
        this.data  = data;
        this.code = code;
        this.errorCode = errorCode;
        this.message = message;
        if (loggerObj)
            this.loggerObj = loggerObj;
    }

    static success(data, message = '', code = 200, errorCode = 0, loggerObj = false) {

        code = (typeof code == 'string') ? statusCodes[code] : code;

        return new ApiSuccess(data, message, code, errorCode, loggerObj);
    }
}
 
module.exports = ApiSuccess;