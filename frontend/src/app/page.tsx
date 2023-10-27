import { CatEvolution } from "./components/CatEvolution";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <CatEvolution />
      <CatEvolution />
    </main>
  );
}
