export function formatPrice(price) {
    return `${price} FCFA`;
}

export function createButton(text, className, dataset = {}) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.className = className;

    Object.entries(dataset).forEach(([key, value]) => {
        button.dataset[key] = value;
    });

    return button;
}

export function getImagePath(photo) {
    return `assets/images/${photo}`;
}
