import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';


const Add = () => {
    const navigate = useNavigate();
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productSellingPrice, setProductSellingPrice] = useState('');
    const [productType, setProductType] = useState('');
    const [productQuantity, setProductQuantity] = useState('');

    const productTypes = ['Drinks', 'Food', 'Things', 'Spices', 'Detergents', 'Other'];

    const handleAdd = () => {
        navigate('/add');
    };

    const handleHome = () => {
        navigate('/home');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const { data, error } = await supabase
                .from('Products')
                .insert([
                    {
                        product_name: productName,
                        price: parseFloat(productPrice).toFixed(2),
                        selling_price: parseFloat(productSellingPrice).toFixed(2),
                        product_type: productType,
                        quantity: parseInt(productQuantity)
                    }
                ]);

            if (error) throw error;

            setProductName('');
            setProductPrice('');
            setProductSellingPrice('');
            setProductType('');
            setProductQuantity('');

            alert('Product added successfully!');
            
        } catch (error) {
            console.error('Error adding product:', error.message);
            alert('Error adding product. Please try again.');
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductName(value);
    }

    const handlePriceChange = (e) => {
        const { value } = e.target;
        setProductPrice(value);
    }

    const handleSellingPriceChange = (e) => {
        const { value } = e.target;
        setProductSellingPrice(value);
    }

    const handleTypeChange = (e) => {
        const { name, value } = e.target;
        setProductType(value);
    }

    const handleQuantityChange = (e) => {
        const { value } = e.target;
        setProductQuantity(value);
    }

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
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit} className="add-form">
                <input type="text" placeholder="Product Name" value={productName} onChange={handleChange} />
                <input 
                    type="text" 
                    placeholder="Product Price (0.00)" 
                    value={productPrice} 
                    onChange={handlePriceChange} 
                    pattern="\d*\.?\d*"
                />
                <input 
                    type="text" 
                    placeholder="Product Selling Price (0.00)" 
                    value={productSellingPrice} 
                    onChange={handleSellingPriceChange}
                    pattern="\d*\.?\d*"
                />
                <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={productQuantity} 
                    onChange={handleQuantityChange}
                    min="0"
                />
                <select value={productType} onChange={handleTypeChange}>
                    <option value="">Select Product Type</option>
                    {productTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
                <button type="submit">Add Product</button>
            </form>
        </main>
    </section>
    </div>
    );
}

export default Add;
