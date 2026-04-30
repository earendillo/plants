import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap border-0 rounded-full",
  {
    variants: {
      variant: {
        // ── Status badges ──────────────────────────────────────────
        // Compact pill, uppercase — used beside plant name (e.g. "−2d", "Today")
        overdue:
          "bg-brand-alert/10 text-brand-alert text-[11px] font-bold tracking-[0.04em] uppercase px-[10px] py-[4px]",
        "due-today":
          "bg-brand-amber/[0.12] text-brand-amber text-[11px] font-bold tracking-[0.04em] uppercase px-[10px] py-[4px]",
        ok:
          "bg-white/[0.05] text-brand-fg-dim text-[11px] font-medium px-[10px] py-[4px]",

        // Verbose pill — used inline (e.g. "2 days overdue", "due today")
        "overdue-verbose":
          "bg-brand-alert/[0.15] text-brand-alert text-[11px] font-semibold px-[9px] py-[3px]",
        "due-today-verbose":
          "bg-brand-amber/[0.15] text-brand-amber text-[11px] font-semibold px-[9px] py-[3px]",

        // ── Legacy / shadcn defaults (kept for compatibility) ──────
        default:
          "bg-brand-cta text-brand-cta-fg text-xs font-semibold px-2.5 py-0.5",
        secondary:
          "bg-white/[0.06] text-brand-fg-sub text-xs font-medium px-2.5 py-0.5",
        destructive:
          "bg-brand-alert/10 text-brand-alert text-xs font-medium px-2.5 py-0.5",
        outline:
          "border border-white/10 text-brand-fg-sub text-xs font-medium px-2.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
