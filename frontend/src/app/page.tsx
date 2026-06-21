import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-6xl font-extrabold text-blue-600 tracking-tight">CodeArena</h1>
      <p className="text-xl text-gray-600">The Ultimate Competitive Coding Platform</p>
      <Link href="/login">
        <Button size="lg" className="text-lg px-8 py-6">Enter the Arena</Button>
      </Link>
    </div>
  );
}
