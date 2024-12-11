import React, { useState, useEffect } from 'react';
import supabase from '../supabase';

function Home() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('Products').select('*');
            if (error) {
                console.error("Error fetching products:", error);
            } else {
                setProducts(data);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.price.toString().includes(searchTerm) ||
        product.selling_price.toString().includes(searchTerm) ||
        product.product_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="home">
            <header className="App-header">
                <h1>Store Inventory</h1>
            </header>
            <section className="container">
                <nav>
                    <button aria-label="Home">home</button>
                    <button aria-label="Add">add</button>
                    <button aria-label="Delete">delete</button>
                    <button aria-label="Edit">edit</button>
                </nav>
                <main>
                    <section className="products-header">
                        <h2>Products</h2>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </section>
                    <table>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Selling Price</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.product_name}</td>
                                    <td>₱{product.price.toFixed(2)}</td>
                                    <td>₱{product.selling_price.toFixed(2)}</td>
                                    <td>{product.product_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            </section>
        </div>
    );
}

export default Home;