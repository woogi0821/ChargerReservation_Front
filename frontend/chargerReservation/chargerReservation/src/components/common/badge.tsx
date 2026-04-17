import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-full border transition-all select-none gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400",
  {
    variants: {
      variant: {
        primary: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200/80",
        secondary: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200/80",
        danger: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200/80",
        outline: "bg-transparent border-zinc-300 text-zinc-500 hover:bg-zinc-50",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
  leftIcon?: ReactNode;
}

export const Badge = ({
  variant,
  size,
  children,
  leftIcon,
  className,
  onClick,
  ...props
}: BadgeProps) => {
  const isClickable = !!onClick;

  return (
    <span
      className={twMerge(
        badgeVariants({ variant, size }),
        isClickable && "cursor-pointer active:scale-95", // 클릭 시에만 효과 적용
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : "status"}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {leftIcon && (
        <span className="flex items-center shrink-0">
          {leftIcon}
        </span>
      )}
      <span className="leading-none">{children}</span>
    </span>
  );
};
