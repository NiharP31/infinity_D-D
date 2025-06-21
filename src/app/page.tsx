import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">Infinity</h1>
      <p className="text-xl mb-8 text-center max-w-xl">An infinite D&D-inspired adventure. Choose your path, shape your destiny.</p>
      <Link href="/game">
        <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-semibold transition">Start Adventure</button>
      </Link>
    </div>
  );
}
