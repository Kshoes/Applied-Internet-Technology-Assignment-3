// webby.js
const net = require('net');
const fs = require('fs');
const path = require('path');

const HTTP_STATUS_CODES = {
    200: "OK",
    404: "NOT FOUND",
    500: "Internal Server Error"
};


const MIME_TYPES = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    html: "text/html",
    css: "text/css",
    txt: "text/plain"
};


class Request {
    constructor(httpRequest) {
        const [method, path, ...remainder] = httpRequest.split(' ');
        this.method = method;
        this.path = path;
    }
}


class Response {

}


function getExtension(fileName) {
    return path.extname(fileName.toLowerCase()).substring(1);
}


function getMIMEType(fileName) {

    const ext = getExtension(fileName);

    if(MIME_TYPES[ext] === undefined) {
        return "";
    }

    return MIME_TYPES[ext];
}













module.exports = {
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    MIME_TYPES: MIME_TYPES,
    getExtension: getExtension,
    getMIMEType: getMIMEType,
    Request: Request, Response,


};
