import Image from "next/image";

export function VehiloLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center overflow-hidden rounded-[16px] border border-white/20 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.6)]">
        <Image
          src="/pwa/icons/icon-512.png"
          alt=""
          width={48}
          height={48}
          className="size-11 object-contain"
          priority
        />
      </div>
      <div className="leading-tight">
        <div className="text-xl font-extrabold tracking-[-0.04em] text-white">Vehilo</div>
        <div className="text-xs font-medium text-muted-foreground">Smart vehicle hub</div>
      </div>
    </div>
  );
}
