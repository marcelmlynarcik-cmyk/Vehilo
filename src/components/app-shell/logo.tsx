import Image from "next/image";

export function VehiloLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-32 items-center justify-center overflow-hidden rounded-[16px] border border-border bg-[rgba(13,23,30,0.9)] px-3 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <Image
          src="/logo/Logo.png"
          alt=""
          width={144}
          height={48}
          className="h-8 w-auto object-contain brightness-0 invert"
          priority
        />
      </div>
      <div className="leading-tight">
        <div className="text-xs font-medium text-muted-foreground">Smart vehicle hub</div>
      </div>
    </div>
  );
}
