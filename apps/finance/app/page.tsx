import { Dashboard } from "@/components/dashboard";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
