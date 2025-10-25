import React, { useState, useEffect, useReducer, useMemo } from 'react';
// 🚨 FIX: Removed imports for unresolvable packages. 
// We will now rely on global Google objects loaded via <script>.

// --- Global Script Injection for Tailwind CSS ---
// Ensures Tailwind is loaded synchronously.
(() => {
    if (typeof window !== 'undefined' && !document.getElementById('tailwind-script')) {
        const script = document.createElement('script');
        script.id = 'tailwind-script';
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);
    }
})();
// --------------------------------------------------

// --- Global Script Injection for Google Identity Services ---
// Ensures the Google 'gsi/client' library is loaded immediately.
(() => {
    if (typeof window !== 'undefined' && !document.getElementById('google-gsi-script')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        document.head.appendChild(script);
    }
})();
// --------------------------------------------------


// --- Utility Functions ---

// Manual JWT Decoding (Replaces jwtDecode library)
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
};

// --- State Management (UNCHANGED) ---
const initialCartState = [];

const cartReducer = (state, action) => {
// ... (cartReducer logic remains the same)
    switch (action.type) {
        case 'ADD_TO_CART': {
            const product = action.payload;
            const existingItem = state.find(item => item.productId === product.id);

            if (existingItem) {
                return state.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...state, { 
                    productId: product.id, 
                    name: product.name, 
                    price: product.price, 
                    quantity: 1 
                }];
            }
        }
        case 'UPDATE_QUANTITY': {
            const { productId, delta } = action.payload;
            return state.reduce((acc, item) => {
                if (item.productId === productId) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity > 0) {
                        acc.push({ ...item, quantity: newQuantity });
                    }
                } else {
                    acc.push(item);
                }
                return acc;
            }, []);
        }
        case 'CLEAR_CART':
            return initialCartState;
        default:
            return state;
    }
};

// --- Mock Product Data (UNCHANGED) ---
const PRODUCTS = [
    { id: 'p1', name: 'Vintage Analog Camera', price: 249.99, image: 'https://placehold.co/100x100/38761D/ffffff?text=Camera', description: 'Classic 35mm film camera, perfect for enthusiasts.' },
    { id: 'p2', name: 'Artisan Leather Wallet', price: 59.99, image: 'https://placehold.co/100x100/000000/ffffff?text=Wallet', description: 'Handmade, full-grain leather bifold wallet.' },
    { id: 'p3', name: 'Wireless Noise-Cancelling Headphones', price: 199.00, image: 'https://placehold.co/100x100/4A86E8/ffffff?text=Audio', description: 'Industry-leading sound quality and battery life.' },
    { id: 'p4', name: 'Aero-Dynamic Running Shoes', price: 129.50, image: 'https://placehold.co/100x100/F1C232/000000?text=Shoes', description: 'Featherlight design with reactive foam sole.' },
];

// --- Sub-Components (CartItem, ProductCard, ShoppingCart) (UNCHANGED) ---

const CartItem = ({ item, dispatch }) => {
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                    ${item.price.toFixed(2)} x {item.quantity}
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.productId, delta: -1 } })}
                    className="p-1 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    aria-label={`Decrease quantity of ${item.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                </button>
                <span className="text-sm w-4 text-center">{item.quantity}</span>
                <button
                    onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.productId, delta: 1 } })}
                    className="p-1 text-sm bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                    aria-label={`Increase quantity of ${item.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const ProductCard = ({ product, dispatch }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden flex flex-col">
            {/* Image Placeholder */}
            <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200/cccccc/333333?text=Image+Unavailable"; }}
                />
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
                
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-extrabold text-indigo-600">
                        ${product.price.toFixed(2)}
                    </span>
                    <button
                        onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}
                        className="flex items-center px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1a1 1 0 011 1v2.219a6 6 0 001.328 4.766 8.423 8.423 0 006.16 2.584c.328 0 .653-.021.975-.062l1.693 2.54a1 1 0 00.842.432h.5a1 1 0 00.842-1.564l-1.956-2.934a10.088 10.088 0 00.56-4.148c-.066-.37-.152-.734-.265-1.092L17 5a1 1 0 00-.842-.432h-1.5a1 1 0 00-.842 1.564l.583.874a8.04 8.04 0 01-1.332 3.963 6.425 6.425 0 01-4.782 2.05c-1.393 0-2.73-.393-3.89-1.092A5.998 5.998 0 014 6V4a1 1 0 011-1h14a1 1 0 000-2H3z" />
                        </svg>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShoppingCart = ({ isOpen, onClose, cartState, dispatch, onLogout }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const totalItemsInCart = useMemo(() => 
        cartState.reduce((total, item) => total + item.quantity, 0), 
        [cartState]
    );

    const cartTotal = useMemo(() => 
        cartState.reduce((total, item) => total + (item.price * item.quantity), 0), 
        [cartState]
    );

    const handleCheckout = () => {
        if (cartState.length === 0) return;
        
        setIsProcessing(true);
        console.log('--- Initiating Checkout ---');

        setTimeout(() => {
            setIsProcessing(false);
            dispatch({ type: 'CLEAR_CART' }); // Clear the cart
            onClose(); // Close the cart view
            document.getElementById('app-message').innerText = 'Order Successfully Placed! Cart is now empty.';
            setTimeout(() => document.getElementById('app-message').innerText = '', 3000);
        }, 1500);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Side Drawer */}
            <div 
                className={`fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 1a1 1 0 000 2h1a1 1 0 011 1v8a5 5 0 004.75 5.564c-.062-.284-.132-.565-.216-.842l-1.636-5.454a1 1 0 01.192-.748l.006-.008.005-.005a1 1 0 011.026-.264c.243.084.488.175.736.273a8.42 8.42 0 005.658 0c.248-.098.493-.189.736-.273a1 1 0 011.026.264l.005.005.006.008a1 1 0 01.192.748l-1.636 5.454c-.084.277-.154.558-.216.842A5 5 0 0016 12V4a1 1 0 011-1h1a1 1 0 100-2H3z" />
                            </svg>
                            Shopping Cart ({totalItemsInCart})
                        </h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                            aria-label="Close cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                        {cartState.length === 0 ? (
                            <p className="text-center text-gray-500 mt-10">Your cart is empty. Time to shop!</p>
                        ) : (
                            cartState.map(item => (
                                <CartItem key={item.productId} item={item} dispatch={dispatch} />
                            ))
                        )}
                    </div>

                    {/* Footer / Summary */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-gray-700">Subtotal:</span>
                            <span className="text-xl font-extrabold text-indigo-600">${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cartState.length === 0 || isProcessing}
                            className={`w-full py-3 rounded-xl font-bold transition duration-200 shadow-lg ${
                                cartState.length === 0 || isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-[1.01]'
                            }`}
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                `Checkout - $${cartTotal.toFixed(2)}`
                            )}
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full mt-3 py-3 rounded-xl font-bold transition duration-200 shadow-lg bg-red-500 text-white hover:bg-red-600"
                        >
                            Logout
                        </button>
                        <p className='text-xs text-center text-gray-500 mt-2'>Note: This is a simulated checkout and does not charge a card.</p>
                    </div>
                </div>
            </div>
        </>
    );
};


/**
 * ECommerceSite Component (The Shop Logic)
 */
const ECommerceSite = ({ onLogout }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

    const totalItemsInCart = useMemo(() => 
        cartState.reduce((total, item) => total + item.quantity, 0), 
        [cartState]
    );

    // 🚨 FIX: Removed useEffect here as Tailwind is loaded globally now.
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Global Message Box */}
            <div 
                id="app-message" 
                className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-3 bg-indigo-500 text-white rounded-lg shadow-xl z-50 text-sm"
                style={{ minWidth: '300px', textAlign: 'center' }}
            >
                {/* Messages like "Order Placed" will appear here */}
            </div>

            {/* Header / Navbar */}
            <header className="bg-white shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                        Swift Shop 🛍️
                    </h1>
                    
                    {/* Right side buttons/icons */}
                    <div className="flex items-center space-x-4">
                        {/* Logout Button in Navbar */}
                        <button
                            onClick={onLogout}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition duration-150"
                        >
                            Logout
                        </button>
                        
                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition duration-150 transform hover:scale-105 shadow-xl"
                            aria-label="Open shopping cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalItemsInCart > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    {totalItemsInCart}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Product Grid */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Featured Products</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRODUCTS.map(product => (
                        <ProductCard key={product.id} product={product} dispatch={dispatch} />
                    ))}
                </div>
            </main>

            {/* Shopping Cart Drawer */}
            <ShoppingCart 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cartState={cartState}
                dispatch={dispatch}
                onLogout={onLogout} // Pass the logout function down
            />

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm">&copy; 2025 Swift Shop. All rights reserved.</p>
                    <p className="text-xs mt-1 text-gray-400">Powered by React Hooks.</p>
                </div>
            </footer>
        </div>
    );
};

// --- Embedded LoginPage Component (Prevents file resolution errors) ---

// Function to simulate sending the JWT to your backend
const sendTokenToBackend = async (jwtToken) => {
    // 1. You should replace this with your actual backend endpoint
    const backendUrl = 'http://localhost:5000/api/auth/google'; 

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: jwtToken }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Backend verification successful. User session created:", data);
            // Store the session token received from your backend
            localStorage.setItem('userSession', JSON.stringify(data.token)); 
        } else {
            console.error("Backend error:", data.message);
        }
    } catch (error) {
        console.error("Network or backend connection error:", error);
    }
};

const LoginPage = ({ onLoginSuccess }) => {
    
    // State to hold the Google Client ID
    // 🚨 IMPORTANT: You must replace this with your actual Google Client ID 🚨
    const GOOGLE_CLIENT_ID = "51532875137-i88eutsv5c8tnn954i3f5abuupvn28ae.apps.googleusercontent.com"; // Your ID from the console

    // 1. Initialize Google Identity Services Script
    useEffect(() => {
        // We ensure the Google script is fully loaded before trying to access window.google
        const checkGoogleScript = () => {
            if (window.google && window.google.accounts) {
                // 2. Initialize the Google Identity Services client
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse, // Function to call after successful authentication
                });
                
                // 3. Render the customized Google Sign-In button
                window.google.accounts.id.renderButton(
                    document.getElementById('signInDiv'),
                    { 
                        theme: "outline", 
                        size: "large", 
                        text: "signin_with",
                        width: "240"
                    }  // Customization options
                );
            } else {
                // Wait for the script to load (should be fast since it's injected globally)
                setTimeout(checkGoogleScript, 100);
            }
        };

        checkGoogleScript();
    }, [GOOGLE_CLIENT_ID]);

    // Function executed upon successful Google login (called by the Google script)
    const handleCredentialResponse = (response) => {
        const jwtToken = response.credential;
        console.log('Google Sign-in Successful. JWT Token:', jwtToken);

        // Decode the JWT using the manual utility function
        const decodedUser = decodeJWT(jwtToken);
        
        if (decodedUser) {
            console.log('Decoded User Info (Client Side):', decodedUser.email, decodedUser.name);

            // 1. Send to Backend for Verification (Crucial Security Step)
            sendTokenToBackend(jwtToken);
            
            // 2. Notify parent App component that login was successful
            onLoginSuccess(); 
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-10 rounded-xl shadow-2xl text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Swift Shop</h1>
                <p className="text-gray-600 mb-8">Please sign in to access the store.</p>
                
                <div className="flex items-center justify-center">
                    {/* This div is where the native Google button will be rendered */}
                    <div id="signInDiv"></div>
                </div>
            </div>
        </div>
    );
};
// --- End Embedded LoginPage Component ---


/**
 * Main Application Wrapper (Now self-contained and handles Auth + Shop)
 */
const App = () => {
    // Check local storage for the user session token on load
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userSession'));

    const handleLogin = () => {
        // This is called by the LoginPage after successful token handling
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        setIsLoggedIn(false);
        // NOTE: In a native script implementation, the googleLogout() call is not needed 
        // unless you want to log out of ALL Google sessions in the browser.
    };

    return (
        <div className="App">
            {isLoggedIn ? (
                // User is logged in: Show the E-commerce site
                <ECommerceSite onLogout={handleLogout} />
            ) : (
                // User is NOT logged in: Show the embedded Login Page
                <LoginPage onLoginSuccess={handleLogin} /> 
            )}
        </div>
    );
};

export default App;
