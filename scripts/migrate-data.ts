import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://easyshop-mongodb:27017/easyshop';
const scriptDir = path.resolve(path.dirname(''));

// Product Schema
const productSchema = new mongoose.Schema({
  _id: { type: String }, // Allow string IDs
  originalId: { type: String }, // Store the original ID
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  oldPrice: Number,
  categories: [String],
  image: [String],
  rating: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  shop_category: { type: String, required: true },
  unit_of_measure: String,
  colors: [String],
  sizes: [String]
}, {
  timestamps: true,
  _id: false // Disable auto-generated ObjectId
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Function to get correct image path based on shop category
function getImagePath(originalPath: string, shopCategory: string): string {
  const fileName = path.basename(originalPath);
  const categoryMap: { [key: string]: string } = {
    electronics: 'gadgetsImages',
    medicine: 'medicineImages',
    grocery: 'groceryImages',
    clothing: 'clothingImages',
    furniture: 'furnitureImages',
    books: 'books',
    beauty: 'makeupImages',
    snacks: 'groceryImages',
    bakery: 'bakeryImages',
    bags: 'bagsImages'
  };
  
  const imageDir = categoryMap[shopCategory] || shopCategory + 'Images';
  return `/${imageDir}/${fileName}`;
}

async function migrateData() {
  try {
    console.log('Attempting to connect to MongoDB at:', MONGODB_URI);
    
    // Connect to MongoDB with options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });
    
    console.log('Successfully connected to MongoDB');

    // Get the project root directory (one level up from scripts)
    const projectRoot = path.resolve(__dirname, '..');
    
    // Read the JSON file from the project root
    const jsonData = await fs.readFile(
      path.join(projectRoot, '.db', 'db.json'),
      'utf-8'
    );
    const data = JSON.parse(jsonData);

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Create a map to track used IDs
    const usedIds = new Set<string>();

    // Prepare products for insertion with unique IDs
    const products = data.products.map((product: any) => {
      // Ensure ID is unique and padded
      let paddedId = product.id.padStart(10, '0');
      while (usedIds.has(paddedId)) {
        const num = parseInt(paddedId);
        paddedId = (num + 1).toString().padStart(10, '0');
      }
      usedIds.add(paddedId);

      // Fix image paths
      const fixedImages = product.image.map((img: string) => 
        getImagePath(img, product.shop_category)
      );

      return {
        _id: paddedId,
        originalId: paddedId,
        ...product,
        image: fixedImages
      };
    });

    // Insert products
    await Product.insertMany(products);
    console.log(`Migrated ${products.length} products`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateData();
