"use client";

import type { ComponentProps } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CustomInputProps<TFormValues extends FieldValues> = Omit<
  ComponentProps<typeof Input>,
  "form" | "name"
> & {
  form: UseFormReturn<TFormValues>;
  name: Path<TFormValues>;
  label: string;
  fieldClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
};

const CustomInput = <TFormValues extends FieldValues>({
  form,
  name,
  label,
  id,
  type = "text",
  placeholder,
  className,
  fieldClassName,
  inputClassName,
  labelClassName,
  ...props
}: CustomInputProps<TFormValues>) => {
  const inputId = id ?? name;
  const error = form.formState.errors[name] as
    | { message?: string }
    | undefined;

  return (
    <Field data-invalid={!!error} className={cn("w-full", fieldClassName)}>
      <div className="form-item w-full">
        <FieldLabel
          htmlFor={inputId}
          className={cn("form-label", labelClassName)}
        >
          {label}
        </FieldLabel>
        <div className="mb-1 flex w-full flex-col">
          <Input
            id={inputId}
            type={type}
            placeholder={placeholder}
            aria-invalid={!!error}
            className={cn("input-class min-h-11 px-3", inputClassName, className)}
            {...form.register(name)}
            {...props}
          />
        </div>
        <FieldError errors={[error]} />
      </div>
    </Field>
  );
};

export default CustomInput;
