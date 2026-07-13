import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex min-h-11 shrink-0 items-center justify-center rounded-[15px] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 active:not-aria-[haspopup]:translate-y-0 disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "premium-gradient text-white shadow-[var(--shadow-accent)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_38px_rgba(45,212,163,0.24),inset_0_1px_0_rgba(255,255,255,0.2)] active:translate-y-0 active:brightness-95",
        outline:
          "border-border bg-[rgba(13,23,30,0.72)] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "border-[rgba(251,113,133,0.34)] bg-destructive/10 text-destructive hover:bg-destructive/18 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-12 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-9 min-h-9 gap-1 rounded-xl px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 min-h-10 gap-1.5 rounded-[13px] px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11",
        "icon-xs":
          "size-9 min-h-9 rounded-xl in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-10 min-h-10 rounded-[13px] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-13 rounded-[17px]",
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
  asChild = false,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : ButtonPrimitive

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
