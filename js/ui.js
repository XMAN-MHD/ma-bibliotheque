import { createButton, formatPrice, getImagePath } from "./utils.js";

export default class UI {
    constructor(manager) {
        this.manager = manager;
        this.editingBookId = null;

        this.elements = {
            addBookBtn: document.querySelector("#addBookBtn"),
            searchInput: document.querySelector("#searchInput"),
            categoryFilter: document.querySelector("#categoryFilter"),
            booksGrid: document.querySelector("#booksGrid"),
            booksCount: document.querySelector("#booksCount"),
            pagination: document.querySelector("#pagination"),
            detailsModal: document.querySelector("#detailsModal"),
            detailsContent: document.querySelector("#detailsContent"),
            bookFormModal: document.querySelector("#bookFormModal"),
            bookForm: document.querySelector("#bookForm"),
            formTitle: document.querySelector("#formTitle"),
            bookId: document.querySelector("#bookId"),
            bookTitle: document.querySelector("#bookTitle"),
            bookAuthor: document.querySelector("#bookAuthor"),
            bookCategory: document.querySelector("#bookCategory"),
            bookYear: document.querySelector("#bookYear"),
            bookPrice: document.querySelector("#bookPrice"),
            bookPhoto: document.querySelector("#bookPhoto")
        };
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.elements.addBookBtn.addEventListener("click", () => {
            this.openFormModal();
        });

        this.elements.searchInput.addEventListener("input", (event) => {
            this.manager.search(event.target.value);
            this.renderBooks();
            this.renderPagination();
        });

        this.elements.categoryFilter.addEventListener("change", (event) => {
            this.manager.filterByCategory(event.target.value);
            this.renderBooks();
            this.renderPagination();
        });

        this.elements.bookForm.addEventListener("submit", (event) => {
            event.preventDefault();
            this.saveBook();
        });

        document.addEventListener("click", (event) => {
            const closeButton = event.target.closest("[data-close-modal]");
            const actionButton = event.target.closest("[data-action]");
            const pageButton = event.target.closest("[data-page]");

            if (closeButton) {
                this.closeModal(closeButton.dataset.closeModal);
            }

            if (actionButton) {
                this.handleBookAction(actionButton);
            }

            if (pageButton) {
                this.handlePagination(pageButton.dataset.page);
            }
        });
    }

    // =========================
    // RENDER PRINCIPAL
    // =========================
    render() {
        this.renderCategoryFilter();
        this.renderBooks();
        this.renderPagination();
    }

    renderCategoryFilter() {
        const currentValue = this.elements.categoryFilter.value;

        this.elements.categoryFilter.innerHTML =
            '<option value="">Toutes les catégories</option>';

        this.manager.getCategories().forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            this.elements.categoryFilter.appendChild(option);
        });

        this.elements.categoryFilter.value = currentValue;
    }

    renderBooks() {
        const books = this.manager.getPaginatedBooks();
        const totalBooks = this.manager.getAllFilteredBooks().length;

        this.elements.booksCount.textContent =
            `${totalBooks} livre${totalBooks > 1 ? "s" : ""}`;

        const grid = this.elements.booksGrid;
        grid.innerHTML = "";

        if (!books.length) {
            grid.innerHTML = '<p class="empty-state">Aucun livre trouvé.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const book of books) {
            fragment.appendChild(this.createBookCard(book));
        }

        grid.appendChild(fragment);
    }

   createBookCard(book) {

    const card = document.createElement("article");
    card.className = "book-card";

    card.innerHTML = `
        <div class="book-cover">
            <img
                src="${getImagePath(book.photo)}"
                alt="${book.title}"
                onerror="this.src='assets/images/placeholder.jpg'"
            >
        </div>

        <div class="book-content">

            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>

            <button
                class="btn btn-primary"
                data-action="details"
                data-id="${book.id}">
                Voir
            </button>

        </div>
    `;

    return card;
}

   createCell(text, label) {
        const cell = document.createElement("td");

        cell.textContent = text;
        cell.dataset.label = label;

        return cell;
    }

    renderPagination() {
        const totalPages = this.manager.getTotalPages();
        const currentPage = this.manager.currentPage;

        this.elements.pagination.innerHTML = "";

        // Previous
        this.elements.pagination.appendChild(
            createButton("Précédent", "btn", { page: "previous" })
        );

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            this.elements.pagination.appendChild(
                createButton(String(i), i === currentPage ? "btn active" : "btn", {
                    page: i
                })
            );
        }

        // Next
        this.elements.pagination.appendChild(
            createButton("Suivant", "btn", { page: "next" })
        );
    }

    handlePagination(page) {
        if (page === "previous") {
            this.manager.previousPage();
        } else if (page === "next") {
            this.manager.nextPage();
        } else {
            this.manager.goToPage(Number(page));
        }

        this.renderBooks();
        this.renderPagination();
    }

    handleBookAction(button) {
        const { id, action } = button.dataset;

        if (action === "details") {
            this.openDetailsModal(id);
        }

        if (action === "edit") {
            this.closeModal("detailsModal");
            this.openFormModal(id);
        }

        if (action === "delete") {

            if (!confirm("Voulez-vous vraiment supprimer ce livre ?")) {
                return;
            }

            const deletedBook = this.manager.deleteBook(id);

            if (!deletedBook) {
                this.showToast(
                    "❌ Impossible de supprimer le livre",
                    "danger"
                );
                return;
            }

            this.closeModal("detailsModal");

            this.showToast(
                "🗑️ Livre supprimé avec succès",
                "danger"
            );

            this.render();
        }
    }

    openDetailsModal(bookId) {
        const book = this.manager.findBookById(bookId);
        if (!book) return;

        this.elements.detailsContent.innerHTML = `
            <div class="book-detail">

                <div class="book-detail-cover">
                    <img src="${getImagePath(book.photo)}" alt="${book.title}">
                </div>

                <div class="book-detail-info">

                    <h2>${book.title}</h2>

                    <p><strong>Auteur :</strong> ${book.author}</p>
                    <p><strong>Catégorie :</strong> ${book.category}</p>
                    <p><strong>Année :</strong> ${book.year}</p>
                    <p><strong>Prix :</strong> ${formatPrice(book.price)}</p>

                    <div class="detail-actions">

                        <button
                            class="btn btn-edit"
                            data-action="edit"
                            data-id="${book.id}">
                            Modifier
                        </button>

                        <button
                            class="btn btn-delete"
                            data-action="delete"
                            data-id="${book.id}">
                            Supprimer
                        </button>

                    </div>

                </div>
            </div>
        `;

        this.openModal("detailsModal");
    }

    openFormModal(bookId = null) {
        const book = bookId ? this.manager.findBookById(bookId) : null;

        this.editingBookId = bookId;
        this.elements.bookForm.reset();

        this.elements.formTitle.textContent = book
            ? "Modifier un livre"
            : "Ajouter un livre";
       
        this.renderCategoryOptions();

        if (book) {
            this.elements.bookId.value = book.id;
            this.elements.bookTitle.value = book.title;
            this.elements.bookAuthor.value = book.author;
            this.elements.bookCategory.value = book.category;
            this.elements.bookYear.value = book.year;
            this.elements.bookPrice.value = book.price;
            this.elements.bookPhoto.value = book.photo;
        }

        this.openModal("bookFormModal");
    }

    saveBook() {
        const data = {
            title: this.elements.bookTitle.value.trim(),
            author: this.elements.bookAuthor.value.trim(),
            category: this.elements.bookCategory.value.trim(),
            year: Number(this.elements.bookYear.value),
            price: Number(this.elements.bookPrice.value),
            photo: this.elements.bookPhoto.value.trim()
        };

        if (this.editingBookId) {
            this.manager.updateBook(this.editingBookId, data);
            this.showToast(
                "✏️ Livre modifié avec succès",
                "warning"
            );
        } else {
            this.manager.addBook(data);
            this.showToast(
                "✅ Livre ajouté avec succès",
                "success"
            );
        }

        this.closeModal("bookFormModal");
        this.editingBookId = null;

        this.renderBooks();
        this.renderPagination();
    }

    openModal(id) {
        document.querySelector(`#${id}`).hidden = false;
    }

    closeModal(id) {
        document.querySelector(`#${id}`).hidden = true;
    }

    renderCategoryOptions() {
    const select = this.elements.bookCategory;

    const currentValue = select.value;

    select.innerHTML = "";

    this.manager.getCategories().forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    // restaurer la valeur si modification
    select.value = currentValue;
    }

    showToast(message, type = "success") {
        const container = document.querySelector("#toastContainer");

        const toast = document.createElement("div");

        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}