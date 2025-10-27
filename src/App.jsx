import React, { useState, useEffect, useReducer, useMemo } from 'react';
import LoginPage from "./components/LoginPage";

// --- Load Tailwind (CDN fallback for safety) ---
(() => {
  if (typeof window !== 'undefined' && !document.getElementById('tailwind-script')) {
    const script = document.createElement('script');
    script.id = 'tailwind-script';
    script.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(script);
  }
})();

// --- Load Google Identity Service ---
(() => {
  if (typeof window !== 'undefined' && !document.getElementById('google-gsi-script')) {
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
  }
})();

// --- Utility: Decode JWT manually ---
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
};

// --- Reducer for Cart ---
const initialCartState = [];
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = action.payload;
      const existingItem = state.find((item) => item.productId === product.id);
      if (existingItem) {
        return state.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...state,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ];
      }
    }
    case 'UPDATE_QUANTITY': {
      const { productId, delta } = action.payload;
      return state.reduce((acc, item) => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > 0) acc.push({ ...item, quantity: newQuantity });
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

// --- Product Data ---
const PRODUCTS = [
  { id: 'p1', name: 'Vintage Analog Camera', price: 249.99, image: 'https://placehold.co/300x200?text=Camera', description: 'Classic 35mm film camera, perfect for enthusiasts.' },
  { id: 'p2', name: 'Artisan Leather Wallet', price: 59.99, image: 'https://placehold.co/300x200?text=Wallet', description: 'Handmade, full-grain leather bifold wallet.' },
  { id: 'p3', name: 'Wireless Headphones', price: 199.0, image: 'https://placehold.co/300x200?text=Headphones', description: 'Noise-cancelling with superb audio.' },
  { id: 'p4', name: 'Running Shoes', price: 129.5, image: 'https://placehold.co/300x200?text=Shoes', description: 'Featherlight design with reactive foam sole.' },
];

// --- Cart Item ---
const CartItem = ({ item, dispatch }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100">
    <div>
      <p className="font-semibold text-gray-800">{item.name}</p>
      <p className="text-xs text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.productId, delta: -1 } })}
        className="px-2 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
      >-</button>
      <span>{item.quantity}</span>
      <button
        onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.productId, delta: 1 } })}
        className="px-2 py-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
      >+</button>
    </div>
  </div>
);

// --- Product Card ---
const ProductCard = ({ product, dispatch }) => (
  <div className="bg-white rounded-xl shadow hover:shadow-xl transition flex flex-col">
    <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-lg font-bold mb-1">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-3 flex-grow">{product.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-xl font-extrabold text-indigo-600">${product.price.toFixed(2)}</span>
        <button
          onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

// --- Shopping Cart ---
const ShoppingCart = ({ isOpen, onClose, cartState, dispatch, onLogout }) => {
  const total = useMemo(() => cartState.reduce((acc, i) => acc + i.price * i.quantity, 0), [cartState]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between p-4 border-b">
          <h2 className="font-bold text-xl">Shopping Cart</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {cartState.length === 0 ? (
            <p className="text-gray-500 mt-8 text-center">Your cart is empty.</p>
          ) : (
            cartState.map((item) => <CartItem key={item.productId} item={item} dispatch={dispatch} />)
          )}
        </div>
        <div className="border-t p-4">
          <p className="font-semibold text-gray-700 mb-3">Total: ${total.toFixed(2)}</p>
          <button
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            onClick={() => {
              alert('Order placed!');
              dispatch({ type: 'CLEAR_CART' });
              onClose();
            }}
          >
            Checkout
          </button>
          <button
            onClick={onLogout}
            className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

// --- Shop Page ---
const ECommerceSite = ({ onLogout }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  return (
    <div className="w-screen min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold text-indigo-600">Swift Shop 🛍️</h1>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            Logout
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600"
          >
            🛒
            {cartState.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                {cartState.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow w-full px-6 md:px-12">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} dispatch={dispatch} />
          ))}
        </div>
      </main>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartState={cartState}
        dispatch={dispatch}
        onLogout={onLogout}
      />

      <footer className="bg-gray-800 text-white text-center py-4 w-full">
        <p>&copy; 2025 Swift Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userSession'));

  return (
    <div className="App">
      {isLoggedIn ? (
        <ECommerceSite
          onLogout={() => {
            localStorage.removeItem('userSession');
            setIsLoggedIn(false);
          }}
        />
      ) : (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;
