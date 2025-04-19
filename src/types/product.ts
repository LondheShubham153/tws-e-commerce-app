export type GroceryProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  unit_of_measure: string;
  shop_category: string;
};

export type GadgetProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
};

export type BakeryProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
};

export type ClothingProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
  colors: string[];
  sizes: string[];
};

export type MakeupProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
  colors: string[];
};

export type BagsProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
  colors: string[];
};

export type BooksProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  authors: string[];
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
};

export type MedicineProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
  colors: string[];
};

export type AllProduct =
  | GroceryProduct
  | GadgetProduct
  | BakeryProduct
  | ClothingProduct
  | MakeupProduct
  | BagsProduct
  | BooksProduct
  | MedicineProduct;

export type SingleProductType = GroceryProduct &
  GadgetProduct &
  BakeryProduct &
  ClothingProduct &
  MakeupProduct &
  BagsProduct &
  BooksProduct &
  MedicineProduct;

export type ProductResponse = {
  products: AllProduct[];
  total: number;
  skip: number;
  limit: number;
};
