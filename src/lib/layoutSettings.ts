import { FilterOptions } from "@/components/filters/FilterNav";
import { ProductCardVariants } from "@/components/cards/ProductCard";

// here you can change heroImages, filterOptions and productCard variants for specific shop

interface HeroImage {
  bgImg: string;
}

interface Hero {
  images: HeroImage[];
}

interface Category {
  hero: Hero;
  filterOptions?: FilterOptions;
  productCardVariants?: ProductCardVariants;
}

interface Data {
  [key: string]: Category;
}

const layoutSettings: Data = {
  // bags
  bags: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/clothing1.png",
        },
        {
          bgImg: "/heroImages/clothing2.png",
        },
        {
          bgImg: "/heroImages/clothing3.png",
        },
      ],
    },

    productCardVariants: "style-1",
  },

  //   bakery
  bakery: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/bakery1.png",
        },
        {
          bgImg: "/heroImages/bakery2.png",
        },
      ],
    },
  },

  //   books
  books: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/book1.png",
        },
      ],
    },
    productCardVariants: "book-card",
  },

  //   clothing
  clothing: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/clothing1.png",
        },
        {
          bgImg: "/heroImages/clothing2.png",
        },
        {
          bgImg: "/heroImages/clothing3.png",
        },
      ],
    },
    filterOptions: {
      useColor: true,
      usePrice: true,
    },
  },

  //   furniture
  furniture: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/furniture1.png",
        },
      ],
    },
  },

  //   gadgets
  gadgets: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/gadget1.png",
        },
        {
          bgImg: "/heroImages/gadget2.png",
        },
        {
          bgImg: "/heroImages/gadget3.png",
        },
      ],
    },

    filterOptions: {
      useColor: true,
      usePrice: true,
    },

    productCardVariants: "style-1",
  },

  //   grocery
  grocery: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/grocery.png",
        },
      ],
    },
    productCardVariants: "style-2",
  },

  //   makeup
  makeup: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/makeup1.png",
        },
        {
          bgImg: "/heroImages/makeup2.png",
        },
      ],
    },
    productCardVariants: "style-3",
  },

  //   medicine
  medicine: {
    hero: {
      images: [
        {
          bgImg: "/heroImages/medicine.png",
        },
      ],
    },
  },
};

export default layoutSettings;
