const products = [
    {
        title: "HP Laptop",
        price: "₹25,000",
        category: "Electronics",
        image: "https://via.placeholder.com/300x180?text=HP+Laptop"
    },
    {
        title: "Engineering Physics Book",
        price: "₹300",
        category: "Books",
        image: "https://via.placeholder.com/300x180?text=Physics+Book"
    },
    {
        title: "Mountain Bicycle",
        price: "₹4,500",
        category: "Cycles",
        image: "https://via.placeholder.com/300x180?text=Bicycle"
    },
    {
        title: "Study Lamp",
        price: "₹500",
        category: "Hostel Essentials",
        image: "https://via.placeholder.com/300x180?text=Study+Lamp"
    },
    {
        title: "Scientific Calculator",
        price: "₹700",
        category: "Electronics",
        image: "https://via.placeholder.com/300x180?text=Calculator"
    },
    {
        title: "Office Chair",
        price: "₹1,500",
        category: "Hostel Essentials",
        image: "https://via.placeholder.com/300x180?text=Chair"
    }
];

const container = document.getElementById("products");

function renderProducts() {

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `
            <div class="product-card">

                <img src="${product.image}" alt="${product.title}">

                <h3>${product.title}</h3>

                <p>${product.category}</p>

                <p class="price">${product.price}</p>

                <button>View Details</button>

            </div>
        `;
    });
}

renderProducts();