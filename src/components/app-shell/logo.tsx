import Image from "next/image";

export function VehiloLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-border dark:bg-neutral-950">
        <Image
          src="/logo/Logo.png"
          alt=""
          width={40}
          height={40}
          className="size-9 object-contain"
          priority
        />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">Vehilo</div>
        <div className="text-xs text-muted-foreground">Chytrý přehled vozidel</div>
      </div>
    </div>
  );
}
