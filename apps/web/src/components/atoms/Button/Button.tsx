import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "../Spinner";

const buttonVariants = cva(
  "inline-flex w-full items-center justify-center gap-2 rounded-field px-4 py-2.5 text-body font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-content hover:bg-primary/90",
        secondary:
          "border border-base-300 bg-base-100 text-base-content hover:bg-base-200",
        ghost: "text-primary hover:bg-primary/10",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  variant,
  isLoading,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  );
}
