import Logo from "@/assets/Logo";
import SignupForm from "@/components/forms/SignupForm";
import Link from "next/link";

const RegisterPage = () => {
  return (
    <div className="max-w-xl mx-auto pt-12 pb-20 px-default">
      <div className="flex text-center flex-col items-center">
        <Logo />
        <p className="my-3">
          By signing up, you agree to our{" "}
          <Link href={"/"} className="text-primary hover:underline">
            terms & policy
          </Link>
        </p>
      </div>

      <SignupForm />

      <div className="flex-1 h-0.5 bg-muted my-6"></div>
      <p className="text-center">
        Already have any account?{" "}
        <Link href={"/login"} className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
