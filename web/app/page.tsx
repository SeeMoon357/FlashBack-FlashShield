import { DemoDashboard } from "@/components/demo-dashboard";
import { demoSnapshot } from "@/lib/demo-data";

export default function HomePage() {
  return <DemoDashboard snapshot={demoSnapshot} />;
}
