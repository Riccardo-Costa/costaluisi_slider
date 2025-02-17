const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5600;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));

// Legge gli utenti da file
const readUsersFromFile = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('users.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

// Endpoint per caricare immagini
app.get('/images', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) return res.status(500).send('Errore nel caricamento delle immagini');
        
        const images = files.map(file => ({ name: file }));
        res.json(images); // Restituisce l'elenco delle immagini
    });
});

// Endpoint login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Username:', username, 'Password:', password);

    try {
        const users = await readUsersFromFile();

        if (users[username] && users[username] === password) {
            res.json({ message: "Login successful" });
        } else {
            res.status(401).json({ error: "Credenziali errate" });
        }
    } catch (error) {
        console.error("Errore nel leggere gli utenti:", error);
        res.status(500).json({ error: "Errore interno" });
    }
});

// Endpoint logout
app.post('/logout', (req, res) => {
    res.json({ message: "Logged out successfully" });
});

// Endpoint per caricare file
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("Errore: Nessun file caricato.");
        return res.status(400).json({ error: "Nessun file caricato" });
    }
    console.log("File ricevuto:", req.file);
    res.json({ message: "File caricato con successo!", fileName: req.file.filename });
});

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
