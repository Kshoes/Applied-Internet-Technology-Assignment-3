// app.js

// const webby = require('./webby.js');
// const app = new webby.App();

// app.use((req, res, next) => {
//     console.log(req.method, req.path);
//     next();
// });

// app.get('/hello', function(req, res) {
//     // send back a response if route matches
//     res.send('<h1>HELLO WORLD</h1>');
// });

// app.listen(3000, '127.0.0.1');
// console.log('started server');

const webby = require("./webby.js");
const fs = require("fs");
const path = require("path");


const app = new webby.App();

app.use(webby.static(path.join(__dirname, "..", "public")));

function sendFile(localPath, req, res, next) {
    const fullPath = path.join(__dirname, "..", localPath);

    fs.readFile(fullPath, (err, data) => {
        if(err) {
            next();
        }
        else {
            const type = webby.getMIMEType(req.path);
            res.set("Content-Type", type);
            res.status(200).send(data);
        }
    });
}

app.get("/", function(req, res, next) {
    // const indexPath = path.join(__dirname, "..", "/public/html/index.html");

    // fs.readFile(indexPath, (err, data) => {
    //     if(err) {
    //         next();
    //     }
    //     else {
    //         const type = webby.getMIMEType(req.path);
    //         res.set("Content-Type", type);
    //         res.status(200).send(data);
    //     }
    // })
    sendFile("/public/html/index.html", req, res, next);
});

app.get("/gallery", function(req, res, next) {

    const galleryPath = path.join(__dirname, "..", "/public/html/gallery.html");

    fs.readFile(galleryPath, "utf-8", (err, data) => {
        if(err) {
            next();
        }
        else {
            const type = webby.getMIMEType(req.path);
            res.set("Content-Type", type);

            const imgCount = Math.floor(Math.random()*4+1);

            let randomizeImg = data;
            // console.log(data);
            for(let i = 0; i < imgCount; i++) {
                const imgId = Math.floor(Math.random()*4+1);
                const imgTag = "<img src=\"../img/turtle" + imgId + ".jpg\">";
                // console.log(imgTag);
                randomizeImg = randomizeImg.replace(/<p><\/p>/, imgTag);
            }

            res.status(200).send(randomizeImg);
        }
    });

    // sendFile("/public/html/gallery.html", req, res, next);
});

app.get("/pics", function(req, res) {

    req.path = "/gallery";
    res.set("Location", "/gallery");
    res.status(308).send("<http><head><meta http-equiv=\"Refresh\" content=\"0; url=localhost:3000/gallery\"/></head><body></body></http>");

});

app.get("/css/styles.css", function(req, res, next) {
    sendFile("/public/css/styles.css", req, res, next);
});


app.get("/img/turtle1.jpg", function(req, res, next) {
    sendFile("/public/img/turtle1.jpg", req, res, next);
});
app.get("/img/turtle2.jpg", function(req, res, next) {
    sendFile("/public/img/turtle2.jpg", req, res, next);
});
app.get("/img/turtle3.jpg", function(req, res, next) {
    sendFile("/public/img/turtle3.jpg", req, res, next);
});
app.get("/img/turtle4.jpg", function(req, res, next) {
    sendFile("/public/img/turtle4.jpg", req, res, next);
});


app.listen(3000, "127.0.0.1");
console.log("Listening on port 3000!");


