"use client";

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, RefreshCw, CheckCircle, TrendingUp, X } from 'lucide-react';

export default function ShopkeeperDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mocking API fetch
    setTimeout(() => {
      setInventory([
        { _id: '1', name: 'Apples', stock: 50, price: 120, category: 'Fruits' },
        { _id: '2', name: 'Milk', stock: 12, price: 65, category: 'Dairy' },
        { _id: '3', name: 'Bread', stock: 0, price: 40, category: 'Bakery' },
      ]);
      setOrders([
        { _id: '101', customer: 'John Doe', items: 3, total: 245, status: 'pending', time: '10 mins ago' },
        { _id: '102', customer: 'Jane Smith', items: 1, total: 65, status: 'processing', time: '1 hr ago' },
        { _id: '103', customer: 'Mike Johnson', items: 5, total: 890, status: 'delivered', time: 'Yesterday' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order._id === id ? { ...order, status: newStatus } : order
    ));
  };

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: '', price: '', stock: '', description: '' });

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: '', price: '', stock: '', description: '' });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setInventory(inventory.map(p => p._id === editingProduct._id ? { ...p, ...productForm } : p));
    } else {
      setInventory([{ _id: Date.now().toString(), ...productForm }, ...inventory]);
    }
    setShowProductModal(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl animate-in fade-in duration-500 relative">
      {/* Product Modal overlay */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowProductModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Product Name</label>
                 <input required name="name" value={productForm.name} onChange={handleProductFormChange} className="w-full p-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Price (₹)</label>
                   <input required type="number" name="price" value={productForm.price} onChange={handleProductFormChange} className="w-full p-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Stock</label>
                   <input required type="number" name="stock" value={productForm.stock} onChange={handleProductFormChange} className="w-full p-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none" />
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select required name="category" value={productForm.category} onChange={handleProductFormChange} className="w-full p-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none appearance-none">
                    <option value="" disabled>Select a category</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Grains">Grains & Pulses</option>
                    <option value="Household">Household</option>
                  </select>
               </div>
               <div className="pt-4 flex justify-end space-x-3">
                 <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 font-medium rounded-lg hover:bg-muted transition-colors">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                   {editingProduct ? 'Save Changes' : 'Add Product'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your inventory, sales, and fulfill local orders efficiently.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg mt-4 md:mt-0 w-max">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'orders' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Orders 
            <span className="ml-2 bg-primary/20 text-primary px-1.5 rounded-full text-xs">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg mr-4">
            <Package className="w-6 h-6" />
          </div>
          <div>
             <p className="text-sm text-muted-foreground font-medium">Total Products</p>
             <h3 className="text-2xl font-bold">{inventory.length}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg mr-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
             <p className="text-sm text-muted-foreground font-medium">Pending Orders</p>
             <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
             <p className="text-sm text-muted-foreground font-medium">Today&apos;s Sales</p>
             <h3 className="text-2xl font-bold">₹1,200</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center bg-primary text-primary-foreground">
             <p className="text-sm font-medium opacity-90 mb-1">Monthly Revenue</p>
             <h3 className="text-3xl font-extrabold flex items-center"><span className="text-lg mr-1 opacity-80 font-normal">₹</span>42,500</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-xl border bg-card animate-pulse"></div>
      ) : activeTab === 'inventory' ? (
        <section className="bg-card border rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b flex justify-between items-center bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2" /> Current Stock
            </h2>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock Level</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-secondary rounded text-xs">{item.category}</span></td>
                    <td className="px-6 py-4">₹{item.price}</td>
                    <td className="px-6 py-4">
                      {item.stock > 10 ? (
                        <span className="text-emerald-500 font-medium">{item.stock} in stock</span>
                      ) : item.stock > 0 ? (
                        <span className="text-amber-500 font-medium">Low stock ({item.stock})</span>
                      ) : (
                        <span className="text-destructive font-medium">Out of stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenEditModal(item)} className="text-primary hover:underline text-xs font-medium mr-4">Edit</button>
                      <button onClick={() => setInventory(inventory.filter(i => i._id !== item._id))} className="text-destructive hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          {orders.map(order => (
            <div key={order._id} className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="font-bold text-lg">Order #{order._id}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                    ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      order.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{order.customer} • {order.items} items • ₹{order.total} • <span className="text-xs">{order.time}</span></p>
              </div>
              
              <div className="flex items-center space-x-3">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'processing')}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Accept & Process
                  </button>
                )}
                {order.status === 'processing' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    className="flex items-center px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Delivered
                  </button>
                )}
                <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
