import Book from "./Book.js";

export default class LibraryManager {
    constructor() {
        this.books = [];
        this.filteredBooks = [];

        this.currentPage = 1;
        this.booksPerPage = 8;

        this.searchText = "";
        this.selectedCategory = "";
    }

    // ======================
    // INITIALISATION
    // ======================
    setBooks(books) {
        this.books = books;
        this.applyFilters();
    }

    // ======================
    // GETTERS
    // ======================
    getBooks() {
        return this.getPaginatedBooks();
    }

    getAllFilteredBooks() {
        return this.filteredBooks;
    }

    getPaginatedBooks() {
        const start = (this.currentPage - 1) * this.booksPerPage;
        return this.filteredBooks.slice(start, start + this.booksPerPage);
    }

    getTotalPages() {
        return Math.max(
            1,
            Math.ceil(this.filteredBooks.length / this.booksPerPage)
        );
    }

    getCategories() {
        return [...new Set(this.books.map(b => b.category))]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
    }

    // ======================
    // CRUD
    // ======================
    addBook(data) {
        const book = new Book(
            crypto.randomUUID(),
            data.title,
            data.author,
            data.category,
            Number(data.year),
            Number(data.price),
            data.photo
        );

        this.books.push(book);
        this.applyFilters();
        this.goToLastPage();

        return book;
    }


    updateBook(id, data) {
    const book = this.findBookById(id);
    if (!book) return null;

    // Nettoyage + fallback intelligent
    const updatedData = {
        title: data.title?.trim() || book.title,
        author: data.author?.trim() || book.author,
        category: data.category?.trim() || book.category,
        year: Number(data.year) || book.year,
        price: Number(data.price) || book.price,
        photo: data.photo?.trim() || book.photo
    };

    // Mise à jour propre de l'objet
    Object.assign(book, updatedData);

    // Recalcul des filtres et pagination
    this.applyFilters();
    this.adjustCurrentPage();

    return book;
    }

    deleteBook(id) {
        const index = this.books.findIndex(b => b.id === id);
        if (index === -1) return null;

        const deleted = this.books.splice(index, 1)[0];

        this.applyFilters();
        this.adjustCurrentPage();

        return deleted;
    }

    findBookById(id) {
        return this.books.find(b => b.id === id);
    }

    // ======================
    // SEARCH / FILTER
    // ======================
    search(text) {
        this.searchText = text.toLowerCase();
        this.currentPage = 1;
        this.applyFilters();
    }

    filterByCategory(category) {
        this.selectedCategory = category;
        this.currentPage = 1;
        this.applyFilters();
    }

    // ======================
    // PAGINATION
    // ======================
    goToPage(page) {
        this.currentPage = Math.max(
            1,
            Math.min(page, this.getTotalPages())
        );
    }

    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    previousPage() {
        this.goToPage(this.currentPage - 1);
    }

    goToLastPage() {
        this.currentPage = this.getTotalPages();
    }

    adjustCurrentPage() {
        const max = this.getTotalPages();
        if (this.currentPage > max) {
            this.currentPage = max;
        }
    }

    // ======================
    // CORE FILTER LOGIC
    // ======================
    applyFilters() {
        this.filteredBooks = this.books.filter(book => {
            const title = (book.title || "").toLowerCase();
            const author = (book.author || "").toLowerCase();
            const category = (book.category || "").toLowerCase();

            const search = this.searchText;

            const matchesSearch =
                title.includes(search) ||
                author.includes(search) ||
                category.includes(search);

            const matchesCategory =
                !this.selectedCategory ||
                book.category === this.selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }
}