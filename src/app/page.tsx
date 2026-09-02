import { Inbox } from "@/components/inbox";
import { JettxLogo } from "@/components/jettx-logo";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex flex-col items-center px-6 pb-4 pt-10 sm:pt-14">
        <JettxLogo
          priority
          className="h-auto w-[min(92vw,34rem)] select-none"
        />
      </header>
      <main className="flex flex-1 flex-col px-3 pb-6 sm:px-6 sm:pb-8">
        <h1 className="sr-only">Jettx inbox</h1>
        <Inbox />
      </main>
    </div>
  );
}
