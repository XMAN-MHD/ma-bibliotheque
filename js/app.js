import LibraryManager from "./LibraryManager.js";
import UI from "./ui.js";
import { loadBooksFromXml } from "./xmlService.js";

document.addEventListener("DOMContentLoaded", async () => {
    const manager = new LibraryManager();

    const ui = new UI(manager);

    try {
        const books = await loadBooksFromXml("books.xml");

        manager.setBooks(books);
        ui.init();

    } catch (error) {
        console.error("Erreur chargement XML :", error);

        const tbody = document.querySelector("#booksTableBody");
        tbody.innerHTML = `
            <tr>
                <td colspan="7">Impossible de charger les livres.</td>
            </tr>
        `;
    }

    // debug option (utile pour étudiants)
    window.manager = manager;
    window.ui = ui;
});