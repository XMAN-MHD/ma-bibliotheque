import Book from "./Book.js";

function getText(node, selector) {
    return node.querySelector(selector)?.textContent.trim() || "";
}

export async function loadBooksFromXml(path = "books.xml") {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error("Impossible de charger books.xml");
    }

    const xmlText = await response.text();
    const xmlDocument = new DOMParser().parseFromString(xmlText, "application/xml");

    if (xmlDocument.querySelector("parsererror")) {
        throw new Error("Fichier XML invalide");
    }

    return Array.from(xmlDocument.querySelectorAll("book")).map((bookNode) => {
        const id = bookNode.getAttribute("id") ?? crypto.randomUUID();
        const category = bookNode.getAttribute("category")?.trim() || "";

        const title = getText(bookNode, "title");
        const author = getText(bookNode, "author");

        const year = Number(getText(bookNode, "year"));
        const price = Number(getText(bookNode, "price").replace(/\s/g, ""));
        const photo = getText(bookNode, "photo");

        return new Book(id, title, author, category, year, price, photo);
    });
}