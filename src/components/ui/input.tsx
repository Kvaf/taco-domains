import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[var(--radius-sm)] border bg-bg2 px-3 py-2 text-text placeholder:text-text3 transition-colors focus:outline-none focus:ring-1",
            error
              ? "border-red text-red focus:border-red focus:ring-red/30"
              : "border-border focus:border-fire focus:ring-fire/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
