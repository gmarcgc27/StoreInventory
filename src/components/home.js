import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editForm, setEditForm] = useState({
        product_name: '',
        price: '',
        selling_price: '',
        product_type: '',
        quantity: ''
    });
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const productTypes = ['Drinks', 'Food', 'Things', 'Spices', 'Detergents', 'Other'];
    const [currentTypeIndex, setCurrentTypeIndex] = useState(-1);
    const [originalProducts, setOriginalProducts] = useState([]);

    const handleAdd = () => {
        navigate('/add');
    };

    const handleHome = () => {
        navigate('/');
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase.from('Products').select('*');
                if (error) {
                    setError(error.message);
                } else {
                    const formattedData = data.map(product => ({
                        ...product,
                        price: Number(product.price),
                        selling_price: Number(product.selling_price)
                    }))
                    .sort((a, b) => a.id - b.id);
                    
                    setProducts(formattedData);
                    setOriginalProducts(formattedData);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = searchTerm
        ? products.filter(product =>
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.price.toString().includes(searchTerm) ||
            product.selling_price.toString().includes(searchTerm) ||
            product.product_type.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : products;

    const handleEdit = (id) => {
        const product = products.find(p => p.id === id);
        setSelectedProduct(product);
        setEditForm({
            product_name: product.product_name,
            price: product.price,
            selling_price: product.selling_price,
            product_type: product.product_type,
            quantity: product.quantity
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        const product = products.find(p => p.id === id);
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const { error } = await supabase
                .from('Products')
                .delete()
                .eq('id', selectedProduct.id);
            
            if (error) throw error;
            
            setProducts(products.filter(p => p.id !== selectedProduct.id));
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const { error } = await supabase
                .from('Products')
                .update({
                    product_name: editForm.product_name,
                    price: parseFloat(editForm.price),
                    selling_price: parseFloat(editForm.selling_price),
                    product_type: editForm.product_type,
                    quantity: parseInt(editForm.quantity)
                })
                .eq('id', selectedProduct.id);

            if (error) throw error;

            setProducts(products.map(p => 
                p.id === selectedProduct.id 
                    ? { ...p, ...editForm, price: parseFloat(editForm.price), selling_price: parseFloat(editForm.selling_price), quantity: parseInt(editForm.quantity) }
                    : p
            ));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const handleSort = (field) => {
        if (field === 'product_type') {
            // Cycle through product types
            const nextIndex = (currentTypeIndex + 1) % (productTypes.length + 1);
            setCurrentTypeIndex(nextIndex);
            
            if (nextIndex === productTypes.length || nextIndex === -1) {
                // Show all products when we complete the cycle
                setProducts([...originalProducts]);
                setCurrentTypeIndex(-1);
            } else {
                // Filter for current product type
                const filteredProducts = originalProducts.filter(
                    product => product.product_type === productTypes[nextIndex]
                );
                setProducts(filteredProducts);
            }
        } else {
            // Original sorting logic for other fields
            const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
            setSortField(field);
            setSortDirection(newDirection);
            
            const sortedProducts = [...products].sort((a, b) => {
                if (newDirection === 'asc') {
                    return a[field] > b[field] ? 1 : -1;
                } else {
                    return a[field] < b[field] ? 1 : -1;
                }
            });
            
            setProducts(sortedProducts);
        }
    };

    return (
        <div className="home">
            <header className="App-header">
                <h1>Store Inventory</h1>
            </header>
            <section className="container">
            <nav>
            <button aria-label="Home" onClick={handleHome}>H</button>
            <button aria-label="Add" onClick={handleAdd}>+</button>
        </nav>
                <main>
                    {error && <div className="error-message">{error}</div>}
                    {isLoading ? (
                        <div className="loading">Loading...</div>
                    ) : (
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
                    )}
                    <table>
                        <thead>
                            <tr>
                                <th className="small-column">id</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Selling Price</th>
                                <th 
                                    onClick={() => handleSort('product_type')} 
                                    style={{ cursor: 'pointer' }}
                                >
                                    Type {sortField === 'product_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="small-column">Quantity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="small-column text-center">{product.id}</td>
                                    <td>{product.product_name}</td>
                                    <td>₱{product.price.toFixed(2)}</td>
                                    <td>₱{product.selling_price.toFixed(2)}</td>
                                    <td>{product.product_type}</td>
                                    <td className="small-column text-center">{product.quantity}</td>
                                    <td>
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(product.id)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            </section>
            {/* Add Modals */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Edit Product</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="edit-form">
                                <label>Product Name:</label>
                                <input
                                    type="text"
                                    value={editForm.product_name}
                                    onChange={(e) => setEditForm({...editForm, product_name: e.target.value})}
                                />
                            </div>
                            <div className="edit-form">
                                <label>Price:</label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="edit-form">
                                <label>Selling Price:</label>
                                <input
                                    type="number"
                                    value={editForm.selling_price}
                                    onChange={(e) => setEditForm({...editForm, selling_price: e.target.value})}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="edit-form">
                                <label>Product Type:</label>
                                <input
                                    type="text"
                                    value={editForm.product_type}
                                    onChange={(e) => setEditForm({...editForm, product_type: e.target.value})}
                                />
                            </div>
                            <div className="edit-form">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button onClick={() => setIsEditModalOpen(false)} className='cancel-btn'>Cancel</button>
                                <button onClick={handleEditSubmit} className='save-btn'>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete {selectedProduct?.product_name}?</p>
                        <div className="modal-buttons">
                            <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button onClick={handleConfirmDelete} className="delete-btn">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;