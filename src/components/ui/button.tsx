import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = {
  primary:
    "bg-aqua-400 text-navy-950 shadow-[0_12px_30px_rgba(38,198,183,0.18)] hover:bg-aqua-300 focus-visible:ring-aqua-500",
  secondary: "bg-white text-navy-950 hover:bg-aqua-100 focus-visible:ring-aqua-300",
  outlineDark:
    "border border-white/45 bg-transparent text-white hover:border-aqua-300 hover:bg-white/10 hover:text-aqua-200 focus-visible:ring-aqua-300",
  outlineLight:
    "border border-navy-700/40 bg-white text-navy-950 hover:border-aqua-700 hover:bg-aqua-50 hover:text-navy-950 focus-visible:ring-aqua-700",
  subtle:
    "border border-border bg-white text-navy-900 hover:border-aqua-500 hover:bg-aqua-50 focus-visible:ring-aqua-700",
} as const;

const buttonSizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions;

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={buttonStyles({ className, size, variant })} type={type} {...props} />;
}
