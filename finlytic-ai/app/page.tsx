import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Telemetry from "@/components/Telemetry";
import OrderLog from "@/components/OrderLog";
import Capabilities from "@/components/Capabilities";
import Process from "@/components/Process";
import Risk from "@/components/Risk";
import Access from "@/components/Access";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Telemetry />
      <OrderLog />
      <Capabilities />
      <Process />
      <Risk />
      <Access />
      <Footer />
    </main>
  );
}
