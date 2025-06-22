import Image from "next/image";
import { Inter } from "next/font/google";
import { Assistant } from "@/components/app/assistant";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`h-screen w-screen overflow-hidden ${inter.className}`}
    >
      <Assistant />
    </main>
  );
}
