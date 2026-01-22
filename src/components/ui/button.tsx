import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden backdrop-blur-sm [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]",

        primary:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]",

        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive-glow hover:shadow-xl hover:shadow-destructive/30 hover:scale-[1.02] active:scale-[0.98]",

        outline:
          "border border-border bg-background/50 text-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/10",

        secondary:
          "bg-secondary text-secondary-foreground border border-border/50 hover:bg-secondary-hover hover:border-primary/30 hover:shadow-sm",

        ghost:
          "bg-transparent text-foreground hover:bg-accent/10 hover:text-accent",

        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary-hover",

        success:
          "bg-success text-success-foreground shadow-lg shadow-success/20 hover:bg-success-glow hover:shadow-xl hover:shadow-success/30 hover:scale-[1.02] active:scale-[0.98]",

        glass:
          "bg-surface/30 backdrop-blur-md border border-border/50 text-foreground hover:border-primary/60 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10",

        neon:
          "bg-background text-primary border border-primary/60 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:text-primary-foreground hover:bg-primary",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-lg rounded-2xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);



export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
