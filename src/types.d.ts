type SearchParamsType = { [key: string]: string | string[] | undefined };

type GroceryProduct = {
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

type GadgetProduct = {
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

type BakeryProduct = {
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

type ClothingProduct = {
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

type MakeupProduct = {
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

type BagsProduct = {
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

type BooksProduct = {
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

type MedicineProduct = {
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

type AllProduct =
  | GroceryProduct
  | GadgetProduct
  | BakeryProduct
  | ClothingProduct
  | MakeupProduct
  | BagsProduct
  | BooksProduct
  | MedicineProduct;

type SingleProductType = GroceryProduct &
  GadgetProduct &
  BakeryProduct &
  ClothingProduct &
  MakeupProduct &
  BagsProduct &
  BooksProduct &
  MedicineProduct;
