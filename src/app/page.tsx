import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative flex h-full min-h-dvh items-center justify-center px-6">
      <h1 className="sr-only">Jettx</h1>
      <ThemeToggle />
      <Image
        src="/jettx-logo-on-dark.png"
        alt="Jettx"
        width={1118}
        height={334}
        priority
        className="logo-on-dark h-auto w-[min(92vw,36rem)] select-none"
      />
      <Image
        src="/jettx-logo-on-light.png"
        alt="Jettx"
        width={1289}
        height={370}
        priority
        className="logo-on-light h-auto w-[min(92vw,36rem)] select-none"
      />
    </main>
  );
}
