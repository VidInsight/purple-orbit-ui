import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      gap={12}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            "group toast rounded-xl border border-border/80 bg-card/95 text-foreground shadow-xl backdrop-blur-md group-[.toaster]:shadow-xl",
          title: "text-sm font-semibold leading-snug",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          success: "border-emerald-500/30 !bg-emerald-950/95",
          error: "border-red-500/30 !bg-red-950/95",
          warning: "border-amber-500/35 !bg-amber-950/95",
          info: "border-primary/30",
          actionButton: "group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:border-border/60 group-[.toast]:bg-background/80 group-[.toast]:text-foreground/70",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
