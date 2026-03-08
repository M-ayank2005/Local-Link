const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

// Import Models
const User = require('./src/models/userModel');
const Shop = require('./src/models/commerce/Shop');
const Product = require('./src/models/commerce/Product');
const FoodListing = require('./src/models/food/foodListingModel');
const Service = require('./src/models/skills/Service');
const Resource = require('./src/models/resources/Resource');

// Delhi Base coordinates for mocking
const BASE_LAT = 28.6139;
const BASE_LNG = 77.2090;

const getRandomLocation = () => {
    // Randomize within ~5km radius of Delhi
    const r = 5000 / 111300;
    const u = Math.random();
    const v = Math.random();
    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    const new_x = x / Math.cos(BASE_LAT * (Math.PI / 180));
    return [BASE_LNG + new_x, BASE_LAT + y];
};

const runSeeder = async () => {
    try {
        console.log('Cleaning up old mock data...');
        await User.deleteMany({ email: { $regex: '@mock.com' } });
        await Shop.deleteMany({ name: { $regex: 'Mock' } });
        await Product.deleteMany({ name: { $regex: 'Mock' } });
        await FoodListing.deleteMany({ title: { $regex: 'Mock' } });
        await Service.deleteMany({ title: { $regex: 'Mock' } });
        await Resource.deleteMany({ title: { $regex: 'Mock' } });

        console.log('Creating Users...');
        // Create assorted users
        const usersToCreate = [
            { fullName: 'Rajesh (Shopkeeper)', email: 'rajesh@mock.com', phone: '9999999991', role: 'shopkeeper', password: 'password123', location: { type: 'Point', coordinates: getRandomLocation() } },
            { fullName: 'Anjali (Provider)', email: 'anjali@mock.com', phone: '9999999992', role: 'service_provider', password: 'password123', location: { type: 'Point', coordinates: getRandomLocation() } },
            { fullName: 'Amit (Resident)', email: 'amit@mock.com', phone: '9999999993', role: 'resident', password: 'password123', location: { type: 'Point', coordinates: getRandomLocation() } },
            { fullName: 'NGO Food Rescue', email: 'ngo@mock.com', phone: '9999999994', role: 'ngo', password: 'password123', location: { type: 'Point', coordinates: getRandomLocation() } },
            { fullName: 'Priya (Shopkeeper)', email: 'priya@mock.com', phone: '9999999995', role: 'shopkeeper', password: 'password123', location: { type: 'Point', coordinates: getRandomLocation() } },
        ];

        const createdUsers = await User.insertMany(usersToCreate);
        const shopkeeper1 = createdUsers[0]._id;
        const provider1 = createdUsers[1]._id;
        const resident1 = createdUsers[2]._id;
        const shopkeeper2 = createdUsers[4]._id;

        console.log('Creating Shops & Products...');
        const shop1 = await Shop.create({
            name: 'Mock Fresh Mart (Rajesh)',
            owner: shopkeeper1,
            description: 'Your daily needs, fresh vegetables and fruits.',
            location: { type: 'Point', coordinates: getRandomLocation() },
            address: 'Connaught Place, New Delhi',
            isVerified: true
        });

        const shop2 = await Shop.create({
            name: 'Mock Electronics (Priya)',
            owner: shopkeeper2,
            description: 'Best local gadget repairs and accessories.',
            location: { type: 'Point', coordinates: getRandomLocation() },
            address: 'Karol Bagh, New Delhi',
            isVerified: true
        });

        await Product.insertMany([
            { name: 'Mock Organic Tomatoes', description: 'Fresh farm tomatoes 1kg', price: 60, stock: 50, category: 'Vegetables', shop: shop1._id },
            { name: 'Mock Whole Wheat Bread', description: 'Freshly baked every morning', price: 40, stock: 20, category: 'Bakery', shop: shop1._id },
            { name: 'Mock USB-C Cable', description: 'Fast charging cable 2m', price: 299, stock: 100, category: 'Electronics', shop: shop2._id },
            { name: 'Mock LED Bulb 9W', description: 'Energy efficient lighting', price: 150, stock: 75, category: 'Household', shop: shop2._id }
        ]);

        console.log('Creating Food Listings...');
        await FoodListing.insertMany([
            { title: 'Mock Surplus Buffet Food', description: 'Freshly cooked rice and lentil curry from an event.', provider: shopkeeper1, price: 0, quantity: 15, expiryDate: new Date(Date.now() + 86400000), location: { type: 'Point', coordinates: getRandomLocation() } },
            { title: 'Mock Fresh Bakery Leftovers', description: 'Assorted bread and muffins from the morning batch.', provider: shopkeeper2, price: 10, quantity: 10, expiryDate: new Date(Date.now() + 172800000), location: { type: 'Point', coordinates: getRandomLocation() } }
        ]);

        console.log('Creating Services...');
        await Service.insertMany([
            { provider: provider1, title: 'Mock Professional Plumbing', category: 'plumber', description: 'Quick and reliable pipe fixes and installations.', pricePerHour: 300, location: { type: 'Point', coordinates: getRandomLocation() }, isVerified: true, address: { street: 'Lajpat Nagar', city: 'Delhi' } },
            { provider: resident1, title: 'Mock Math Tutoring', category: 'tutor', description: 'High school mathematics tutoring (CBSE).', pricePerHour: 500, location: { type: 'Point', coordinates: getRandomLocation() }, isVerified: true, address: { street: 'Saket', city: 'Delhi' } }
        ]);

        console.log('Creating Resources...');
        await Resource.insertMany([
            { title: 'Mock Bosch Power Drill', description: 'High torque drill with assorted bits.', category: 'drill', condition: 'good', pricePerDay: 400, depositAmount: 1500, owner: resident1, location: { type: 'Point', coordinates: getRandomLocation() }, availableFrom: new Date(), availableTo: new Date(Date.now() + 30 * 86400000) },
            { title: 'Mock 6-Person Camping Tent', description: 'Waterproof tent for weekend getaways.', category: 'tent', condition: 'fair', pricePerDay: 500, depositAmount: 2000, owner: provider1, location: { type: 'Point', coordinates: getRandomLocation() }, availableFrom: new Date(), availableTo: new Date(Date.now() + 60 * 86400000) }
        ]);

        console.log('Data seeding completed successfully! All mocked documents start with "Mock" to distinguish them. Logins are user@mock.com with "password123".');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runSeeder();
