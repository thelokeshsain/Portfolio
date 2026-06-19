import connectDB from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import toPublicPortfolio from "@/utils/publicPortfolio";
import { DataProvider } from "@/context/DataContext";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  let serverData = null;
  try {
    await connectDB();
    const raw = await Portfolio.findOne({}).lean();
    serverData = toPublicPortfolio(raw);
  } catch (err) {
    console.error("DB connection failed during SSR:", err.message);
  }

  return (
    <DataProvider serverData={serverData}>
      {children}
    </DataProvider>
  );
}
