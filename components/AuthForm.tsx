"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import CustomInput from "@/components/CustomInput";
import { FieldGroup } from "@/components/ui/field";
import { authFormSchema, cn, type AuthFormValues } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import SignIn from "@/app/(auth)/sign-in/page";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";

const AuthForm = ({ type }: AuthFormProps) => {
  const [user, setUser] = useState<AuthFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = authFormSchema(type);

  const router = useRouter();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      state: "",
      postalCode: "",
      dateOfBirth: "",
      ssn: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async(data: AuthFormValues) => {
    
    setIsLoading(true);
    setUser(data);
    
    try{
      // We will handle authentication logic here, such as sending data to the server and receiving a response. This is done through Appwrite 
      if(type === "sign-up"){
        // Sign up logic
        console.log("Signing up with data:", data);
        const newUser = await signUp(data);

        setUser(newUser);
      }
      if (type === "sign-in"){
        // Sign in logic
        const response = await signIn(
          {
            email: data.email,
            password: data.password,
          }
        )
        if (response)router.push("/");
      }

    }
    catch(error){
      console.error("Error during authentication:", error);
    }
    finally{
      setIsLoading(false);
    }
  }

  return (
    <section
      className={cn("auth-form", type === "sign-up" && "auth-form-sign-up")}
    >
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="flex cursor-pointer items-center gap-1">
          <Image src="/icons/Milo.png" alt="Logo" width={34} height={34} />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Milo
          </h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 font-semibold text-gray-900 lg:text-36">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user
              ? "Link your account to get started"
              : "Please enter your details"}
          </p>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">{/* Plaid ID */}</div>
      ) : (
        <>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              {type === "sign-up" && (
                <>
                  <div className="flex gap-4">
                    <CustomInput
                      form={form}
                      name="firstName"
                      label="First Name"
                      placeholder="Joel"
                    />
                    <CustomInput
                      form={form}
                      name="lastName"
                      label="Last Name"
                      placeholder="Sari"
                    />
                    
                  </div>

                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomInput
                      form={form}
                      name="address1"
                      label="Street Address"
                      placeholder="Enter your street address"
                      fieldClassName="sm:col-span-2"
                    />
                    <CustomInput
                      form={form}
                      name="city"
                      label="City"
                      placeholder="New Haven"
                    />
                    <CustomInput
                      form={form}
                      name="state"
                      label="State"
                      placeholder="CT"
                    />
                    <CustomInput
                      form={form}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="11111"
                    />
                    <CustomInput
                      form={form}
                      name="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      placeholder="dd/mm/yyyy"
                    />
                    <CustomInput
                      form={form}
                      name="ssn"
                      label="Social Security Number"
                      placeholder="123-45-6789"
                      fieldClassName="sm:col-span-2"
                    />
                  </div>
                </>
              )}

              <CustomInput
                form={form}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
              />

              <CustomInput
                form={form}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
            </FieldGroup>
            <div className="flex flex-col gap-4">
              <Button type="submit" className="form-btn">
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> &nbsp;
                    Loading...
                  </>
                ) : type === "sign-in" ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
