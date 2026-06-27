"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import CustomInput from "@/components/CustomInput";
import { FieldGroup } from "@/components/ui/field";
import { authFormSchema, cn, type AuthFormValues } from "@/lib/utils";
import { Loader2 } from "lucide-react";
// removed unused SignIn import
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";
import PlaidLink from "./PlaidLink";

const AuthForm = ({ type }: AuthFormProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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

  /**
   * Form submission handler for both sign-in and sign-up
   * 
   * For SIGN-UP:
   * 1. Calls signUp server action with form data
   * 2. Server creates account and session cookie
   * 3. Sets user state to trigger account linking flow
   * 4. User can then link their bank account (Plaid integration)
   * 
   * For SIGN-IN:
   * 1. Calls signIn server action with email and password only
   * 2. Server authenticates user and sets session cookie
   * 3. If successful (returns session data), redirect to home page
   * 4. If failed (returns null), show error message
   */
  const onSubmit = async(data: AuthFormValues) => {
    
    // Clear previous auth errors and show loading spinner
    setAuthError(null);
    setIsLoading(true);
    
    try{

      const userData = {
        firstName: data.firstName!,
        lastName: data.lastName!,
        address1: data.address1!,
        city:data.city!,
        state: data.state!,
        postalCode: data.postalCode!,
        dateOfBirth: data.dateOfBirth!,
        ssn: data.ssn!,
        email: data.email,
        password: data.password

      }



      if(type === "sign-up"){
        // SIGN-UP FLOW: Create new account
        console.log("Signing up with data:", data);
        
        // Call server action to create account and session
        const newUser = await signUp(userData);
        
        if (!newUser) {
          setAuthError("Unable to create account. Please check your information and try again.");
          return;
        }

        // Store user data in state to show account linking form
        // The UI will show "Link Account" screen where user connects bank account
        setUser(newUser as User);
      }
      
      if (type === "sign-in"){
        // SIGN-IN FLOW: Authenticate existing user
        // Send only email and password (other fields are N/A for sign-in)
        const response = await signIn(
          {
            email: data.email,
            password: data.password,
          }
        )
        
        // Check if sign-in was successful
        if (response){
          // Success! Session cookie was set by server
          // Redirect to home page
          router.push("/");
        } else {
          // Sign-in failed - response is null
          // This means password was wrong, user doesn't exist, or server error
          setAuthError("Invalid email or password. Please try again.");
        }
      }

    }
    catch(error){
      // Catch any errors during form submission
      // Could be network errors, validation errors, server errors
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setAuthError(message);
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
        <div className="flex flex-col gap-4">

          <PlaidLink user={user} variant="primary"/>

        </div>
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
            {authError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {authError}
              </div>
            )}
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
