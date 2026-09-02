import Image from "next/image";

type JettxLogoProps = {
  className?: string;
  priority?: boolean;
};

export function JettxLogo({ className, priority = false }: JettxLogoProps) {
  return (
    <Image
      src="/jettx-logo.png"
      alt="Jettx"
      width={1118}
      height={334}
      priority={priority}
      className={className}
    />
  );
}
