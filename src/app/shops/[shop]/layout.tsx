import BannerSlider from "@/components/BannerSlider";
import BekaryCategories from "@/components/BekaryCategories";
import FilterNav from "@/components/filters/FilterNav";
import HeroSlider from "@/components/heros/HeroSlider";
import SidebarOne from "@/components/sidebars/SidebarOne";
import SidebarTwo from "@/components/sidebars/SidebarTwo";
import layoutSettings from "@/lib/layoutSettings";
import { notFound } from "next/navigation";
import React from "react";

const medicineBannerImages = [
  {
    img: "/bannerImages/banner1.png",
  },
  {
    img: "/bannerImages/banner2.png",
  },
  {
    img: "/bannerImages/banner3.png",
  },
  {
    img: "/bannerImages/banner4.png",
  },
  {
    img: "/bannerImages/banner5.png",
  },
];

type ShopNames =
  | "bags"
  | "bakery"
  | "books"
  | "clothing"
  | "furniture"
  | "gadgets"
  | "grocery"
  | "makeup"
  | "medicine";

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: {
    shop: string;
  };
}>;

// Dynamic metadata
export async function generateMetadata({ params }: LayoutProps) {
  const { shop } = await params;
  return {
    title: shop,
  };
}

// generate static site params for all shops
export async function generateStaticParams() {
  const shops = Object.keys(layoutSettings);

  return shops.map((shop) => ({
    shop,
  }));
}

const layout = async ({ children, params }: LayoutProps) => {
  const { shop } = await params;
  const settings = layoutSettings?.[shop as ShopNames];

  switch (shop) {
    case "bags":
      return (
        <div className="bags-layout">
          <div className="flex">
            <SidebarOne />
            <div className="flex-1 max-w-full">
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarOne isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    case "bakery":
      return (
        <div className="bakery-layout">
          <HeroSlider heroImages={settings?.hero?.images} />
          <FilterNav
            {...settings.filterOptions}
            sidebar={<SidebarOne isMobile={true} />}
          />
          <BekaryCategories hidenameLink={true} className="max-w-[2700px]" />
          <div className="pb-12 px-default">{children}</div>
        </div>
      );

    case "books":
      return (
        <div className="books-layout">
          <HeroSlider heroImages={settings?.hero?.images} />
          <div className="flex">
            <SidebarOne />
            <div className="flex-1 max-w-full">
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarOne isMobile={true} />}
              />
              <div className="px-default pb-12">{children}</div>
            </div>
          </div>
        </div>
      );

    case "clothing":
      return (
        <div className="clothing-layout">
          <HeroSlider heroImages={settings?.hero?.images} />
          <div className="flex">
            <SidebarOne />
            <div className="flex-1 max-w-full">
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarOne isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    case "furniture":
      return (
        <div className="gadgets-layout">
          <div className="flex">
            <SidebarTwo />
            <div className="flex-1 max-w-full">
              <HeroSlider heroImages={settings?.hero?.images} />
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarTwo isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    case "gadgets":
      return (
        <div className="gadgets-layout">
          <div className="flex">
            <SidebarTwo />
            <div className="flex-1 max-w-full">
              <HeroSlider heroImages={settings?.hero?.images} />
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarTwo isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    case "grocery":
      return (
        <div className="grocery-store">
          <HeroSlider
            heroImages={settings?.hero?.images}
            loop={false}
            autoPlay={false}
          />
          <div className="flex">
            <SidebarOne />
            <div className="flex-1 max-w-full">
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarOne isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    case "makeup":
      return (
        <div className="makeup-store">
          <div className="flex">
            <SidebarOne />
            <div className="flex-1 max-w-full">
              <HeroSlider heroImages={settings?.hero?.images} />
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarOne isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    case "medicine":
      return (
        <div className="medicine-store">
          <HeroSlider
            heroImages={settings?.hero?.images}
            content={{
              title: "Medicine Delivered in 90 Minutes",
              titleClass: "text-gray-900",
              searchBar: true,
              contentClass: "hidden md:flex",
            }}
          />
          <BannerSlider
            bannerImages={medicineBannerImages}
            className="max-w-full"
          />
          <div className="flex mt-10">
            <SidebarOne />
            <div className="flex-1 max-w-full text-gray">
              <FilterNav
                {...settings.filterOptions}
                sidebar={<SidebarOne isMobile={true} />}
              />
              <div className="pb-12 px-default">{children}</div>
            </div>
          </div>
        </div>
      );

    default:
      return notFound();
  }
};

export default layout;
