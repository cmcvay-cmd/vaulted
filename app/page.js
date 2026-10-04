"use client";

import { useState } from "react";
import "./globals.css";

const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 1099,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800",
  },
  {
    id: 2,
    name: "Nike Air Force 1",
    price: 120,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  {
    id: 3,
    name: "Smart Watch",
    price: 89,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: 149,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  },
];

const countries = [
  "Japan",
  "United Kingdom",
  "Germany",
  "Australia",
  "United Arab Emirates",
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [screen, setScreen] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");

  const [delivery, setDelivery] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const checkout = () => {
    if (!country) {
      alert("Please select your shipping country.");
      return;
    }

    if (
      !delivery.name ||
      !delivery.address ||
      !delivery.city ||
      !delivery.postalCode ||
      !delivery.phone
    ) {
      alert("Please complete your delivery information.");
      return;
    }

    setScreen("chat");
  };

  return (
    <main>
      <header className="header">
        <div className="logo" onClick={() => setScreen("home")}>
          <span>🛍</span>
          <div>
            <strong>Shoper</strong>
            <small>Marketplace</small>
          </div>
        </div>

        <div className="search">
          <input
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="cartButton" onClick={() => setScreen("cart")}>
          🛒
          {cart.length > 0 && <b>{cart.length}</b>}
        </button>
      </header>

      <nav className="nav">
        <button onClick={() => setScreen("home")}>Home</button>
        <button onClick={() => setScreen("categories")}>Categories</button>
        <button onClick={() => setScreen("cart")}>Cart</button>
        <button onClick={() => setScreen("admin")}>Admin</button>
      </nav>

      {screen === "home" && (
        <section className="page">
          <div className="hero">
            <div>
              <span className="goldText">SHOP FROM THE USA</span>
              <h1>Global shopping<br />made simple.</h1>
              <p>
                Shop products from the USA and have them shipped
                directly to your country.
              </p>
              <button className="goldButton">
                Shop Now
              </button>
            </div>

            <div className="globe">🌎</div>
          </div>

          <h2>Featured Products</h2>

          <div className="products">
            {filteredProducts.map((product) => (
              <div className="productCard" key={product.id}>
                <div
                  className="productImage"
                  onClick={() => {
                    setSelectedProduct(product);
                    setScreen("product");
                  }}
                >
                  <img src={product.image} alt={product.name} />
                </div>

                <span className="category">{product.category}</span>

                <h3>{product.name}</h3>

                <strong>${product.price.toLocaleString()}</strong>

                <button
                  className="addButton"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {screen === "product" && selectedProduct && (
        <section className="page">
          <button className="back" onClick={() => setScreen("home")}>
            ← Back
          </button>

          <div className="productDetail">
            <img src={selectedProduct.image} alt={selectedProduct.name} />

            <div>
              <span className="category">
                {selectedProduct.category}
              </span>

              <h1>{selectedProduct.name}</h1>

              <div className="rating">★★★★★ 4.8</div>

              <h2>${selectedProduct.price.toLocaleString()}</h2>

              <p>
                Premium product available for shipping from the USA
                to our supported international destinations.
              </p>

              <button
                className="goldButton"
                onClick={() => {
                  addToCart(selectedProduct);
                  setScreen("cart");
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {screen === "categories" && (
        <section className="page">
          <h1>Categories</h1>

          <div className="categoryGrid">
            {[
              "📱 Electronics",
              "👕 Fashion",
              "🏠 Home & Living",
              "💄 Beauty",
              "🏋️ Sports",
              "🎮 Toys & Games",
            ].map((category) => (
              <div className="categoryCard" key={category}>
                {category}
              </div>
            ))}
          </div>
        </section>
      )}

      {screen === "cart" && (
        <section className="page">
          <h1>Your Cart</h1>

          {cart.length === 0 ? (
            <div className="empty">
              <div>🛒</div>
              <h2>Your cart is empty</h2>
              <button
                className="goldButton"
                onClick={() => setScreen("home")}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cartList">
                {cart.map((item) => (
                  <div className="cartItem" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="cartInfo">
                      <h3>{item.name}</h3>
                      <strong>${item.price}</strong>

                      <div className="quantity">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="delete"
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>

              <div className="summary">
                <div>
                  <span>Subtotal</span>
                  <strong>${total.toLocaleString()}</strong>
                </div>

                <div>
                  <span>Shipping</span>
                  <strong>Calculated with seller</strong>
                </div>

                <div className="total">
                  <span>Total</span>
                  <strong>${total.toLocaleString()}</strong>
                </div>

                <button
                  className="goldButton full"
                  onClick={() => setScreen("country")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {screen === "country" && (
        <section className="page smallPage">
          <button className="back" onClick={() => setScreen("cart")}>
            ← Back
          </button>

          <h1>Shipping Country</h1>
          <p>Select where your order will be delivered.</p>

          <div className="countryList">
            {countries.map((item) => (
              <button
                key={item}
                className={country === item ? "country selected" : "country"}
                onClick={() => setCountry(item)}
              >
                <span>{item}</span>
                <span>{country === item ? "●" : "○"}</span>
              </button>
            ))}
          </div>

          <button
            className="goldButton full"
            disabled={!country}
            onClick={() => setScreen("delivery")}
          >
            Continue
          </button>
        </section>
      )}

      {screen === "delivery" && (
        <section className="page smallPage">
          <button className="back" onClick={() => setScreen("country")}>
            ← Back
          </button>

          <h1>Delivery Details</h1>

          <div className="selectedCountry">
            Shipping to: <strong>{country}</strong>
          </div>

          <input
            className="formInput"
            placeholder="Full Name"
            value={delivery.name}
            onChange={(e) =>
              setDelivery({ ...delivery, name: e.target.value })
            }
          />

          <input
            className="formInput"
            placeholder="Address"
            value={delivery.address}
            onChange={(e) =>
              setDelivery({ ...delivery, address: e.target.value })
            }
          />

          <input
            className="formInput"
            placeholder="City"
            value={delivery.city}
            onChange={(e) =>
              setDelivery({ ...delivery, city: e.target.value })
            }
          />

          <input
            className="formInput"
            placeholder="Postal Code"
            value={delivery.postalCode}
            onChange={(e) =>
              setDelivery({
                ...delivery,
                postalCode: e.target.value,
              })
            }
          />

          <input
            className="formInput"
            placeholder="Phone Number"
            value={delivery.phone}
            onChange={(e) =>
              setDelivery({ ...delivery, phone: e.target.value })
            }
          />

          <button
            className="goldButton full"
            onClick={() => setScreen("summary")}
          >
            Continue
          </button>
        </section>
      )}

      {screen === "summary" && (
        <section className="page">
          <button className="back" onClick={() => setScreen("delivery")}>
            ← Back
          </button>

          <h1>Order Summary</h1>

          <div className="orderBox">
            <div className="shippingTo">
              🚚 Shipping to <strong>{country}</strong>
            </div>

            {cart.map((item) => (
              <div className="summaryItem" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div>
                  <strong>{item.name}</strong>
                  <p>
                    ${item.price} × {item.quantity}
                  </p>
                </div>

                <strong>
                  ${(item.price * item.quantity).toLocaleString()}
                </strong>
              </div>
            ))}

            <hr />

            <div className="summaryRow">
              <span>Total</span>
              <strong>${total.toLocaleString()}</strong>
            </div>

            <div className="addressBox">
              <strong>Delivery Address</strong>
              <p>{delivery.name}</p>
              <p>{delivery.address}</p>
              <p>
                {delivery.city}, {delivery.postalCode}
              </p>
              <p>{country}</p>
              <p>{delivery.phone}</p>
            </div>

            <button className="goldButton full" onClick={checkout}>
              Checkout & Chat With Seller
            </button>

            <p className="checkoutNote">
              No online payment is processed. After checkout,
              you'll automatically be connected with the seller.
            </p>
          </div>
        </section>
      )}

      {screen === "chat" && (
        <section className="chatPage">
          <div className="chatHeader">
            <button onClick={() => setScreen("home")}>←</button>

            <div className="sellerAvatar">S</div>

            <div>
              <strong>Shop Owner</strong>
              <small>Online • Shop USA</small>
            </div>
          </div>

          <div className="messages">
            <div className="sellerMessage">
              Hello! Thanks for your order with Shoper Marketplace.
              I received your checkout request.
            </div>

            <div className="sellerMessage">
              Order total: <strong>${total.toLocaleString()}</strong>
              <br />
              Shipping to: <strong>{country}</strong>
            </div>

            <div className="sellerMessage">
              We'll discuss payment and shipping details here.
            </div>
          </div>

          <div className="chatInput">
            <input placeholder="Type a message..." />
            <button>➤</button>
          </div>
        </section>
      )}

      {screen === "admin" && (
        <section className="page">
          <div className="adminHeader">
            <div>
              <span className="goldText">SHOP OWNER</span>
              <h1>Admin Dashboard</h1>
            </div>

            <button className="goldButton">
              + Add Product
            </button>
          </div>

          <div className="stats">
            <div>
              <small>Total Products</small>
              <strong>142</strong>
            </div>

            <div>
              <small>Total Orders</small>
              <strong>58</strong>
            </div>

            <div>
              <small>Active Buyers</small>
              <strong>1,240</strong>
            </div>

            <div>
              <small>Countries</small>
              <strong>5</strong>
            </div>
          </div>

          <h2>Products</h2>

          <div className="adminProducts">
            {products.map((product) => (
              <div className="adminProduct" key={product.id}>
                <img src={product.image} alt={product.name} />

                <div>
                  <strong>{product.name}</strong>
                  <p>{product.category}</p>
                  <span>${product.price}</span>
                </div>

                <button>Edit</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}