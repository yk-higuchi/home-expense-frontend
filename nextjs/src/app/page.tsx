import Dashboard from "@/components/Dashboard";
import {useRouter} from "next/router";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page: number;
    perPage: number;
  }>;
};

const Home = async ({ searchParams }: Props) => {
  const awaited = await searchParams;
  const data = await fetch(`http://localhost:8000/${awaited.page}/settings`);
  const settings = data.json();
  const router = useRouter();

  return (
    <div>
      <main>
        <Dashboard promise={settings} />
      </main>
      <footer></footer>
    </div>
  );
};
export default Home;
