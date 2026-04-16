import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-white/10 bg-brand-surface px-3 py-2 text-sm text-brand-fg transition-colors outline-none placeholder:text-brand-fg-dim focus-visible:border-brand-cta focus-visible:ring-3 focus-visible:ring-brand-cta/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-brand-alert aria-invalid:ring-3 aria-invalid:ring-brand-alert/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
