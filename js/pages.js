const products = [
    {
        title: "HP Laptop",
        price: "₹25,000",
        category: "Electronics"
    },

    {
        title: "Engineering Physics Book",
        price: "₹300",
        category: "Books"
    },

    {
        title: "Mountain Bicycle",
        price: "₹4,500",
        category: "Cycles"
    },

    {
        title: "Hostel Table Lamp",
        price: "₹500",
        category: "Hostel Essentials"
    }
];

const productsContainer = document.getElementById("products");

products.forEach(product => {

    productsContainer.innerHTML += `
    
        <div class="product-card">

            <h3>${product.title}</h3>

            <p>${product.category}</p>

            <p>${product.price}</p>

            <button>View Details</button>

        </div>

    `;
});