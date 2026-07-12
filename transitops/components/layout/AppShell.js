import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-white p-6">{children}</main>
      </div>
    </div>
  );
}