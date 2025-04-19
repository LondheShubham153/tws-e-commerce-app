import Logo from "@/assets/Logo";
import Link from "next/link";
import { FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Footer = () => {
  return (
    <footer className="bg-secondary py-6">
      <div className="container">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-semibold">Subscribe now</h2>
          <p className="mt-3 max-w-sm text-center dark:text-gray-400">
            Subscribe your email for newsletter and featured news based on your
            interest
          </p>

          <form className="flex justify-center items-center max-w-sm mx-auto w-full mt-3">
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Write your email address"
            />
            <Button type="submit" className="text-2xl">
              <IoMdSend />
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10 gap-14">
          <div>
            <Logo />
            <div className="dark:text-gray-400">
              <p className="mt-6">Bihar, India</p>

              <a href="mailto:iemafzalhassan@gmail.com" className="block mt-3">
                iemafzalhassan@gmail.com
              </a>
              <a href="tel:+91 9400344657" className="block mt-1">
                +91 9400344657
              </a>

              <div className="flex flex-wrap gap-3 items-center mt-4">
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10 hover:bg-primary hover:text-white p-0"
                  asChild
                >
                  <a
                    href="https://github.com/iemafzalhassan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10 hover:bg-primary hover:text-white p-0"
                  asChild
                >
                  <a
                    href="https://twitter.com/iemafzalhassan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitter />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full h-10 w-10 hover:bg-primary hover:text-white p-0"
                  asChild
                >
                  <a
                    href="https://www.linkedin.com/in/iemafzalhassan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedinIn />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold">Explore</h4>
            <ul className="mt-6 dark:text-gray-300 [&>li]:mb-3">
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"/shops"}
                >
                  Shops
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"/offers"}
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Flash Deals
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Coupon
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold">Customer Service</h4>
            <ul className="mt-6 dark:text-gray-300 [&>li]:mb-3">
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  FAQ & Helps
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Vendor Refund Policies
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Customer Refund Policies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold">Our Information</h4>
            <ul className="mt-6 dark:text-gray-300 [&>li]:mb-3">
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Manufacturers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Privacy policies
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"#"}
                >
                  Terms & conditions
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline hover:text-primary transition-all duration-300"
                  href={"/contact"}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-3">
            Made with{" "}
            <span className="inline-block animate-heartbeat">
              <svg
                className="w-5 h-5 text-red-500 hover:text-primary transition-all duration-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>{" "}
            by{" "}
            <a
              href="https://iemafzalhassan.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-all duration-300 hover:underline decoration-primary decoration-2 underline-offset-4"
            >
              Md. Afzal Hassan Ehsani
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-medium">{"\u00A9"}</span> {new Date().getFullYear()} All Rights Reserved •{" "}
            <span className="text-gray-600 dark:text-gray-300">
              Released under MIT License for Educational Purposes
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
