import { Outlet } from "react-router";
import Footer from "./components/footer";
import Header from "./components/header";

export default function VantLayout() {
  return (
    <div className="w-screen min-h-screen">
      <Header />
      <main className="w-full min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
