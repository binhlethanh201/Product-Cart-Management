import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

function Product() {
  const [products, setProduct] = useState([]);
  const [search, setSearch] = useState("");
  const [carts, setCarts] = useState([]);
  const [msgProduct, setMsgProduct] = useState(null);

  useEffect(() => {
    fetch("http://localhost:9999/products")
      .then((response) => response.json())
      .then((result) => {
        if (search.length === 0) setProduct(result);
        else {
          const newProduct = result.filter((p) =>
            p.title.toLowerCase().includes(search.toLowerCase())
          );
          setProduct(newProduct);
        }
      })
      .catch((error) => console.error("Error fetching products: ", error));
  }, [search]);

  useEffect(() => {
    fetch("http://localhost:9999/carts")
      .then((response) => response.json())
      .then((result) => setCarts(result))
      .catch((error) => console.error("Error fetching carts: ", error));
  }, []);

  function checkInput() {
    if (carts.length === 0) {
      setMsgProduct("Cart is empty!");
      return false;
    }
    setMsgProduct("");
    return true;
  }

  function handleAddCart(e) {
    e.preventDefault();
    if (checkInput()) {
      const totalPrice = carts
        .reduce((total, cart) => total + cart.price * cart.quantity, 0)
        .toFixed(2);

      const cartData = {
        id: Date.now().toString(),
        products: carts.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: parseFloat(totalPrice), 
      };

      fetch("http://localhost:9999/carts", {
        method: "POST",
        body: JSON.stringify({ carts: [cartData] }), 
        headers: { "Content-Type": "application/json" },
      })
        .then(() => {
          alert("Added to cart successfully!");
          setCarts([]); 
        })
        .catch((error) => console.error("Error saving cart: ", error));
    }
  }

  const totalPrice = carts
    .reduce((total, cart) => total + cart.price * cart.quantity, 0)
    .toFixed(2);

  const addToCart = (product) => {
    const existingProduct = carts.find((item) => item.id === product.id);
    if (existingProduct) {
      setCarts(
        carts.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCarts([...carts, { ...product, quantity: 1 }]);
    }
  };

  const decrementQuantity = (c) => {
    if (c.quantity > 1) {
      setCarts(
        carts.map((item) =>
          item.id === c.id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      setCarts(carts.filter((item) => item.id !== c.id));
    }
  };

  return (
    <Container>
      <Row>
        <h2>Product List</h2>
      </Row>
      <Row>
        <Col md={7}>
          <Row>
            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter title search...."
              style={{ marginBottom: "20px" }}
            />
          </Row>
          <Row>
            <table
              className="table table-hover table-striped table-bordered"
              border={1}
            >
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Function</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title}</td>
                    <td>{p.category}</td>
                    <td>{p.price}</td>
                    <td>
                      <button onClick={() => addToCart(p)}>Add Cart</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Row>
        </Col>

        <Col md={5}>
          <h4 className="font-weight-bold">Shopping Cart</h4>
          {carts.length > 0 ? (
            <>
              <table className="table table-hover table-striped table-bordered" border={1}>
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Increment</th>
                    <th>Decrement</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.title}</td>
                      <td>{c.price}</td>
                      <td>{c.quantity}</td>
                      <td>
                        <button onClick={() => setCarts(carts.map((item) => item.id === c.id ? { ...item, quantity: item.quantity + 1 }: item))}> + </button>
                      </td>
                      <td>
                        <button onClick={() => decrementQuantity(c)}> - </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display: "flex", flexDirection: "column",alignItems: "flex-end"}}>
                <p>Total Price: {totalPrice}</p>
                <button onClick={handleAddCart} style={{ marginTop: "10px" }}>
                  Save to Cart
                </button>
              </div>
            </>
          ) : (
            <p>Cart is empty!</p>
          )}
          {msgProduct && <p style={{ color: "red" }}>{msgProduct}</p>}
        </Col>
      </Row>
    </Container>
  );
}

export default Product;
