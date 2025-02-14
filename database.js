const database = require("./database");

database.createTable();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, "files"));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

app.post("/upload", multer({ storage: storage}).single('file'), async (req, res) => {
await database.insert("./files/" + req.file.originalname);
res.json({result: "ok" });
});