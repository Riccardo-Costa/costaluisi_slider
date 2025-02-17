// Funzione per caricare le immagini e gestire upload, visualizzazione e eliminazione
const createMiddleware = () => {
    return {
        load: async () => {
            const response = await fetch("/images");
            return await response.json();
        },
        delete: async (id) => {
            const response = await fetch("/delete/" + id, { method: 'DELETE' });
            return await response.json();
        },
        upload: async (inputFile) => {
            const formData = new FormData();
            formData.append("file", inputFile.files[0]);

            try {
                const res = await fetch("/upload", { 
                    method: 'POST', 
                    body: formData 
                });
                if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);

                const data = await res.json();
                console.log("Risposta dal server:", data);
                return data;
            } catch (e) {
                console.error("Errore nel caricamento:", e);
            }
        }
    };
};

// Funzione per gestire l'interfaccia di upload e visualizzare i file
const controller = async (middleware) => {
    const template = `<li class="list-group-item">
        <a href="/uploads/$URL" target="_blank">$URL</a>
        <button id="$ID" type="button" class="delete btn btn-danger float-end">X</button>
    </li>`;

    const render = (list) => {
        listUL.innerHTML = list.map((element) => {
            let row = template.replace("$ID", element.id);
            row = row.replace("$URL", element.name);
            return row;
        }).join("\n");

        document.querySelectorAll(".delete").forEach((button) => {
            button.onclick = () => {
                middleware.delete(button.id)
                    .then(() => middleware.load())
                    .then((list) => render(list));
            };
        });
    };

    // Selezione elementi
    const inputFile = document.querySelector('#file');
    const uploadButton = document.querySelector("#uploadButton");
    const listUL = document.getElementById("listUL");

    // Gestione Upload
    uploadButton.onclick = async () => {
        const data = await middleware.upload(inputFile);
        if (data) {
            const list = await middleware.load();
            render(list);
        }
    };

    middleware.load().then(render);
};

// Gestione Login/Logout
document.getElementById("loginButton").onclick = () => {
    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
    loginModal.show();
};

document.getElementById("submitLogin").onclick = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) throw new Error("Login fallito");

        localStorage.setItem("isLoggedIn", "true");
        checkLoginStatus();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        loginModal.hide(); // Chiudi la modale dopo il login

    } catch (error) {
        alert("Credenziali errate");
    }
};

document.getElementById("logoutButton").onclick = async () => {
    await fetch("/logout", { method: "POST" });
    localStorage.removeItem("isLoggedIn");
    checkLoginStatus();
};

// Controlla lo stato di login
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        document.getElementById("uploadSection").style.display = "block";
        document.getElementById("carouselSection").style.display = "none"; // Nascondi il carosello dopo il login
        document.getElementById("loginButton").style.display = "none"; // Nascondi il bottone login
        document.getElementById("logoutButton").style.display = "inline"; // Mostra il bottone logout
        controller(createMiddleware());
    } else {
        document.getElementById("uploadSection").style.display = "none";
        document.getElementById("carouselSection").style.display = "block"; // Mostra il carosello prima del login
        document.getElementById("loginButton").style.display = "inline"; // Mostra il bottone login
        document.getElementById("logoutButton").style.display = "none"; // Nasconde il bottone logout
    }
}

// Controllo iniziale
checkLoginStatus();
