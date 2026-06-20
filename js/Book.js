export default class Book {
    constructor(id, title, author, category, year, price, photo) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.year = year;
        this.price = price;
        this.photo = photo;
    }

    matchesSearch(searchText) {
        const query = searchText.trim().toLowerCase();

        return (
            this.title.toLowerCase().includes(query) ||
            this.author.toLowerCase().includes(query) ||
            this.category.toLowerCase().includes(query)
        );
    }

    belongsToCategory(category) {
        return !category || this.category.toLowerCase() === category.toLowerCase();
    }

    update(data) {
        this.title = data.title;
        this.author = data.author;
        this.category = data.category;
        this.year = data.year;
        this.price = data.price;
        this.photo = data.photo;
    }
}
