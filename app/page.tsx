import { Header } from '@/components/header';
import { Explorer } from '@/components/explorer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Explorer />
    </div>
  );
}
