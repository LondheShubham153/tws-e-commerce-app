import { cn } from "@/lib/utils";
import { AnimatePresence, Variants, motion } from "framer-motion";
import React from "react";
import { HiOutlineXMark } from "react-icons/hi2";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  className?: string;
};

const Modal = ({ isOpen, setIsOpen, children, className }: ModalProps) => {
  const ContainerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={ContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`fixed top-0 left-0 w-full h-screen py-10 px-6 md:px-8 z-[99] flex justify-center items-center`}
        >
          <div
            className="fixed top-0 left-0 w-full h-full bg-black/70"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            className={cn(
              "mx-auto relative z-50 w-full h-full flex justify-center items-center",
              className
            )}
            variants={itemVariants}
          >
            <button
              type="button"
              className="absolute -right-2 -top-4 text-xl p-1 h-6 w-6 bg-primary rounded-full flex justify-center items-center sm:hidden"
              onClick={() => setIsOpen(false)}
              title="close"
            >
              <HiOutlineXMark />
            </button>

            <div className="max-h-full max-w-full overflow-auto w-full h-fit bg-accent rounded-lg">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
