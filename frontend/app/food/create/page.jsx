"use client"; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, ArrowLeft, Send } from 'lucide-react';

export default function CreateFoodListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    quantity: 1,
    ingredients: '', 
    expiryDate: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("You must be logged in to post food.");
      router.push('/login'); 
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const currentMonth = new Date().getMonth(); 
    let autoSeason = 'Winter'; 
    if (currentMonth >= 2 && currentMonth <= 5) autoSeason = 'Summer';
    else if (currentMonth >= 6 && currentMonth <= 9) autoSeason = 'Monsoon';

    const payload = {
      ...formData,
      season: autoSeason, 
      ingredients: formData.ingredients.split(',').map(item => item.trim()),
      coordinates: [80.9462, 26.8467] 
    };

    try {
      const token = localStorage.getItem('authToken'); 
      if (!token) return router.push('/');

      const response = await fetch('http://localhost:5000/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        router.push('/food/dashboard'); // Sends them straight to their dashboard after posting!
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to create listing');
      }
    } catch (err) {
      setError('Server error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <Link href="/food" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
              <Leaf className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">
              Post Surplus Food
            </h1>
          </div>
        </div>
      </nav>

      <div className="p-8 flex justify-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full max-w-2xl mt-4 transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create a Listing</h2>
          
          <p className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 mb-8 flex items-center gap-2">
            ℹ️ The season will be tagged automatically based on today's date.
          </p>
          
          {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 p-4 rounded-xl mb-6 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Food Item Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} 
                className="w-full p-3.5 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                placeholder="e.g., 20 Extra Samosas" />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} 
                className="w-full p-3.5 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                placeholder="Describe the condition and pickup details..." rows="3" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Price (₹)</label>
                <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} 
                  className="w-full p-3.5 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Quantity</label>
                <input type="number" name="quantity" required min="1" value={formData.quantity} onChange={handleChange} 
                  className="w-full p-3.5 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Expiry Date & Time</label>
              <input type="datetime-local" name="expiryDate" required value={formData.expiryDate} onChange={handleChange} 
                className="w-full p-3.5 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition [color-scheme:light] dark:[color-scheme:dark]" />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Ingredients (comma separated)</label>
              <input type="text" name="ingredients" value={formData.ingredients} onChange={handleChange} 
                className="w-full p-3.5 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                placeholder="Potato, Flour, Spices" />
            </div>

            <button type="submit" disabled={loading} 
              className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-emerald-700 transition-all mt-8 shadow-md hover:shadow-lg flex justify-center items-center gap-2">
              {loading ? 'Posting...' : <><Send className="w-5 h-5"/> Post to Network</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}