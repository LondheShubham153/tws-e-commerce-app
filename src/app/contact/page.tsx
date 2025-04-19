import ContactForm from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { FaGithub, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "EasyShop is the user-friendly Next.js eCommerce template perfect for launching your online store. With its clean design and customizable options, EasyShop makes selling online a breeze. Start building your dream store today and boost your online presence effortlessly!",
};

const ContactPage = () => {
  return (
    <div className="max-w-[900px] mx-auto pt-10 pb-20 px-default">
      <h1 className="text-center font-semibold text-3xl md:5xl">Contact</h1>
      <div className="flex gap-7 mt-6 flex-col-reverse md:flex-row">
        <div className="left w-full md:w-2/5">
          <div>
            <h4 className="font-semibold mb-1">Address</h4>
            <p className="text-sm text-muted-foreground">
              Bihar, India
            </p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-1">Phone</h4>
            <p className="text-sm text-muted-foreground">+91 9400344657</p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-1">Email Address</h4>
            <p className="text-sm text-muted-foreground">iemafzalhassan@gmail.com</p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Follow Me</h3>
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
                  href="https://www.linkedin.com/in/iemafzalhassan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedinIn />
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
            </div>
          </div>
        </div>

        <div className="right w-full md:h-3/5">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
