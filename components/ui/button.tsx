import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary — lime CTA
        default:
          "rounded-[14px] bg-brand-cta text-brand-cta-fg text-sm font-bold shadow-[0_4px_20px_rgba(207,238,158,0.2)] hover:brightness-[0.92] active:brightness-[0.84] focus-visible:ring-3 focus-visible:ring-brand-cta/30",
        // Secondary — green outline (OAuth / social actions)
        secondary:
          "rounded-[14px] border-brand-cta/40 bg-transparent text-brand-cta text-sm font-bold hover:bg-brand-cta/5 active:bg-brand-cta/10 focus-visible:ring-3 focus-visible:ring-brand-cta/20",
        // Tertiary — muted ghost
        tertiary:
          "rounded-[12px] border-white/10 bg-white/[0.06] text-brand-fg-sub text-[13px] hover:bg-white/[0.09] active:bg-white/[0.11] focus-visible:ring-3 focus-visible:ring-white/20",
        // Outline — transparent with border
        outline:
          "rounded-[12px] border-white/10 bg-transparent text-brand-fg-sub text-[13px] hover:bg-white/5 focus-visible:ring-3 focus-visible:ring-white/20",
        // Danger ghost — red tinted
        destructive:
          "rounded-[14px] border-brand-alert/40 border-[1.5px] bg-brand-alert/10 text-[#f07070] text-[13px] font-semibold hover:bg-brand-alert/15 active:bg-brand-alert/20 focus-visible:ring-3 focus-visible:ring-brand-alert/25",
        // Danger filled — solid red
        "destructive-solid":
          "rounded-[14px] border-0 bg-brand-alert text-white text-[13px] font-semibold shadow-[0_2px_12px_rgba(224,85,85,0.3)] hover:brightness-[0.92] active:brightness-[0.84] focus-visible:ring-3 focus-visible:ring-brand-alert/30",
        // Ghost — no background
        ghost:
          "rounded-[12px] border-transparent bg-transparent text-brand-fg-dim text-[13px] hover:bg-white/5 hover:text-brand-fg focus-visible:ring-3 focus-visible:ring-white/20",
        // Link — text only
        link: "rounded-[12px] border-transparent text-brand-cta text-[13px] underline-offset-4 hover:underline",
      },
      size: {
        // Action size — 44px tap target (design spec minimum)
        default:
          "h-[44px] gap-1.5 px-[22px]",
        // Compact sizes for inline/toolbar use
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-[18px] text-[13px]",
        lg: "h-[44px] gap-1.5 px-[22px]",
        // Icon buttons — 44px tap target
        icon: "size-[44px] rounded-[12px]",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[12px]",
        "icon-lg": "size-[44px] rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
