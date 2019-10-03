// webby.js
const net = require('net');
const fs = require('fs');
const path = require('path');

const HTTP_STATUS_CODES = {
    200: "OK",
    301: "Moved Permanently",
    404: "Not Found",
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
        this.remainder = remainder;
    }
}


class Response {
    constructor(socket, statusCode, version) {
        this.sock = socket;

        this.statusCode = statusCode;
        this.version = version;
        if(statusCode === undefined) {
            this.statusCode = 200;
        }
        if(version === undefined) {
            this.version = "HTTP/1.1";
        }

        this.headers = {};
    }

    set(name, value) {
        this.headers[name] = value;
    }

    end() {
        this.sock.end();
    }

    statusLineToString() {
        return this.version + " " + this.statusCode + " " + HTTP_STATUS_CODES[this.statusCode] + "\r\n";
    }

    headersToString() {
        let s = "";

        const properties = Object.keys(this.headers);

        for(let propCount = 0; propCount < properties.length; propCount++) {
            s += properties[propCount] + ": " + this.headers[properties[propCount]] + "\r\n";
        }

        return s;
    }

    send(body) {

        if(!Object.prototype.hasOwnProperty.call(this.headers, "Content-Type")) {
            this.set("Content-Type", "text/html");
        }

        const s = this.statusLineToString() + this.headersToString() + "\r\n";
        this.sock.write(s);
        this.sock.write(body);
        this.end();
    }

    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
}


class App {
    constructor() {
        this.server = net.createServer(sock => this.handleConnection(sock));
        this.routes = {};
        this.middleware = null;
    }

    normalizePath(path) {
        const s = path.toLowerCase();
        const rmFrag = s.split('#');
        const rmQuery = rmFrag[0].split('?');
        
        if(rmQuery[0].charAt(rmQuery[0].length-1) === "/") {
            return rmQuery[0].slice(0, rmQuery[0].length-1);
        }
        else {
            return rmQuery[0];
        }
    }

    createRouteKey(method, path) {
        const routeKey = method.toUpperCase() + " " + this.normalizePath(path);
        return routeKey;
    }

    get(path, cb) {
        const routeKey = this.createRouteKey("GET", path);
        this.routes[routeKey] = cb;
    }

    use(cb) {
        this.middleware = cb;
    }

    listen(port, host) {
        this.server.listen(port, host);
    }

    handleConnection(sock) {
        sock.on('data', (data) => this.handleRequest(sock, data));
    }

    handleRequest(sock, binaryData) {
        const req = new Request(binaryData.toString());
        const res = new Response(sock, req.statusCode, req.version);
        if(this.middleware === null) {
            this.processRoutes(req, res);
        }
        else {
            this.middleware(req, res, () => this.processRoutes(req, res));
        }

    }

    processRoutes(req, res) {
        const method = req.method;
        const path = req.path;
        const routeKey = this.createRouteKey(method, path);

        const f = this.routes[routeKey];
        if(f === undefined) { 
            res.status(404).send("Page not found.");
            //console.log("Page not found.");
        }
        else {
            f(req, res);
        }
    }
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

function serveStatic(basePath) {

    const f = function(req, res, next) {

        const fsPath = path.join(basePath, req.path);
        fs.readFile(fsPath, (err, data) => {
            if(err) {
                next();
            }
            else {
                const type = getMIMEType(req.path);
                res.set("Content-Type", type);
                res.status(200).send(data);
            }
        });

    };

    return f;
}


module.exports = {
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    MIME_TYPES: MIME_TYPES,
    getExtension: getExtension,
    getMIMEType: getMIMEType,
    Request: Request,
    Response: Response,
    App: App,
    static: serveStatic
};
