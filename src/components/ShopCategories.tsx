import Image from "next/image";
import Link from "next/link";

const gadgets = [
  {
    title: "Smart phones",
    img: "/shopCategories/smartphones.jpg",
    link: "/shops/gadgets/mobiles",
  },
  {
    title: "Camera",
    img: "/shopCategories/camera.png",
    link: "/shops/gadgets/cameras",
  },
  {
    title: "Laptops",
    img: "/shopCategories/laptop.jpg",
    link: "/shops/gadgets/laptops",
  },
  {
    title: "Headphones",
    img: "/shopCategories/headphone.png",
    link: "/shops/gadgets/headphones",
  },
];

const clothing = [
  {
    title: "Hoodies",
    img: "/shopCategories/hoodies.jpg",
    link: "/shops/clothing/hoodie",
  },
  {
    title: "Tops",
    img: "/shopCategories/tops.jpg",
    link: "/shops/clothing/tops",
  },
  {
    title: "Floral",
    img: "/shopCategories/floral.png",
    link: "/shops/clothing/floral",
  },
  {
    title: "Jeans",
    img: "/shopCategories/jeans.png",
    link: "/shops/clothing/jeans",
  },
];

const beauty = [
  {
    title: "Makeups",
    img: "/shopCategories/makeups.jpg",
    link: "/shops/makeup",
  },
  {
    title: "Lipsticks",
    img: "/shopCategories/lipsticks.jpg",
    link: "/shops/makeup/lip-stick",
  },
  {
    title: "Mascaras",
    img: "/shopCategories/mascaras.jpg",
    link: "/shops/makeup/mascara",
  },
  {
    title: "Facewashes",
    img: "/shopCategories/facewashes.jpg",
    link: "/shops/makeup/facial-care",
  },
];

const furnitures = [
  {
    title: "Furnitures",
    img: "/shopCategories/furnitures.png",
    link: "/shops/furniture",
  },
  {
    title: "Table",
    img: "/shopCategories/tables.png",
    link: "/shops/furniture/tables",
  },
  {
    title: "Sofa",
    img: "/shopCategories/sofa.png",
    link: "/shops/furniture/sofa",
  },
  {
    title: "Chair",
    img: "/shopCategories/chair.png",
    link: "/shops/furniture/chairs",
  },
];

const groceries = [
  {
    title: "Fruits & Vegetables",
    img: "/shopCategories/fruites&vagetables.png",
    link: "/shops/grocery/fruits-and-vegetables",
  },
  {
    title: "Dairy",
    img: "/shopCategories/dairy.jpg",
    link: "/shops/grocery/dairy",
  },
  {
    title: "Snacks",
    img: "/shopCategories/snacks.png",
    link: "/shops/grocery/snacks",
  },
  {
    title: "Meat & Fish",
    img: "/shopCategories/meat&fish.jpg",
    link: "/shops/grocery/meat-and-fish",
  },
];

const medicines = [
  {
    title: "Medicines",
    img: "/shopCategories/health.jpg",
    link: "/shops/medicine",
  },
  {
    title: "Beauty Care",
    img: "/shopCategories/beautycare.png",
    link: "/shops/medicine/beauty-care",
  },
  {
    title: "Baby Care",
    img: "/shopCategories/babycare.png",
    link: "/shops/medicine/baby-care",
  },
  {
    title: "First Aid",
    img: "/shopCategories/firstaid.jpg",
    link: "/shops/medicine/first-aid",
  },
];

const ShopCategories = () => {
  return (
    <section className="shop-categories relative z-10">
      <div className="container mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 min-[991px]:grid-cols-3 gap-5">
          {/* gadgets */}
          <div className="gadgets bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between gap-y-2">
            <div>
              <h2 className="capitalize font-semibold text-2xl">
                Easy Shop <span className="text-primary">Gadget</span> Store
              </h2>
              <div className="grid grid-cols-2 gap-5 mt-5">
                {gadgets.map((item, index) => (
                  <Link
                    href={item.link}
                    key={index}
                    className="hover:text-primary transition-all duration-300"
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={200}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <h3 className="capitalize text-lg mt-1">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                className="hover:underline text-primary"
                href={"/shops/gadgets"}
              >
                Explore More
              </Link>
            </div>
          </div>
          {/* clothing */}
          <div className="clothing bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between gap-y-2">
            <div>
              <h2 className="capitalize font-semibold text-2xl">
                <span className="text-primary">Fashion</span> trends you like
              </h2>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-5">
                {clothing.map((item, index) => (
                  <Link
                    href={item.link}
                    key={index}
                    className="first:col-span-3 [&>div]:first:aspect-[3/2] hover:text-primary transition-all duration-300"
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={200}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <h3 className="capitalize text-lg mt-1">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                className="hover:underline text-primary"
                href={"/shops/clothing"}
              >
                See More
              </Link>
            </div>
          </div>
          {/* beauty products */}
          <div className="beauty bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between gap-y-2">
            <div>
              <h2 className="capitalize font-semibold text-2xl">
                <span className="text-primary">Beauty</span> Products
              </h2>
              <div className="grid grid-cols-2 gap-5 mt-5 h-fit">
                {beauty.map((item, index) => (
                  <Link
                    href={item.link}
                    key={index}
                    className="hover:text-primary transition-all duration-300"
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={200}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <h3 className="capitalize text-lg mt-1">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                className="hover:underline text-primary"
                href={"/shops/makeup"}
              >
                Explore More
              </Link>
            </div>
          </div>

          {/* groceries products */}
          <div className="groceries bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between gap-y-2">
            <div>
              <h2 className="capitalize font-semibold text-2xl">
                Fresh groceries
              </h2>
              <div className="grid grid-cols-2 gap-5 mt-5">
                {groceries.map((item, index) => (
                  <Link
                    href={item.link}
                    key={index}
                    className="hover:text-primary"
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={200}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <h3 className="capitalize text-lg mt-1 transition-colors duration-300">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                className="hover:underline text-primary"
                href={"shops/grocery"}
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Furnitures products */}
          <div className="furnitures bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between gap-y-2">
            <div>
              <h2 className="capitalize font-semibold text-2xl">
                Exclusive Furnitures
              </h2>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-5">
                {furnitures.map((item, index) => (
                  <Link
                    href={item.link}
                    key={index}
                    className="first:col-span-3 [&>div]:first:aspect-[3/2] hover:text-primary transition-all duration-300"
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={200}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <h3 className="capitalize text-lg mt-1">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                className="hover:underline text-primary"
                href={"/shops/furniture"}
              >
                Get More
              </Link>
            </div>
          </div>

          {/* Health products */}
          <div className="Health bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between gap-y-2">
            <div>
              <h2 className="capitalize font-semibold text-2xl">
                Your health partner
              </h2>
              <div className="grid grid-cols-2 gap-5 mt-5">
                {medicines.map((item, index) => (
                  <Link
                    href={item.link}
                    key={index}
                    className="hover:text-primary transition-all duration-300"
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden">
                      <Image
                        src={item.img}
                        width={200}
                        height={200}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <h3 className="capitalize text-lg mt-1">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link
                className="hover:underline text-primary"
                href={"/shops/medicine"}
              >
                Explore More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;
