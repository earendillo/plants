"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

const SIDE_CLASSES = {
  right: "top-0 right-0 bottom-0 w-72 flex-col border-l border-white/[0.07] data-open:slide-in-from-right data-closed:slide-out-to-right",
  bottom: "bottom-0 left-0 right-0 top-auto h-auto w-full flex-col rounded-t-[24px] border-t border-white/[0.07] data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
}

function SheetContent({
  className,
  children,
  showCloseButton = true,
  side = 'right',
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean; side?: 'right' | 'bottom' }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex bg-brand-bg p-6 shadow-2xl duration-300 outline-none data-open:animate-in data-closed:animate-out",
          SIDE_CLASSES[side],
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Popup>
    </SheetPortal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger }
