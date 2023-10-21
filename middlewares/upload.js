const fs = require('fs');
const path = require("path");
const multer = require("multer");
const bodyParser = require('body-parser');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        var dir = path.join(__dirname, '../public');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});

var upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});

module.exports = upload;
