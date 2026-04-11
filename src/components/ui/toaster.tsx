import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import type { ToastProps } from "@/components/ui/toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const toastIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
} satisfies Record<NonNullable<ToastProps["variant"]>, typeof Info>;

function ToastLeadingIcon({ variant }: { variant?: ToastProps["variant"] }) {
  const key = variant ?? "default";
  const Icon = toastIcons[key];

  return (
    <span
      className={cn(
        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-background/40 [&_svg]:size-[1.125rem]",
        key === "default" && "text-primary",
        key === "destructive" && "bg-destructive/15 text-red-100",
        key === "success" && "bg-emerald-500/15 text-emerald-300",
        key === "warning" && "bg-amber-500/15 text-amber-300",
      )}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider label="Notifications (toast)">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex w-full min-w-0 gap-3">
              <ToastLeadingIcon variant={variant} />
              <div className="grid min-w-0 flex-1 gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
