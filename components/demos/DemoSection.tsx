import { DemoRow } from "@/components/today/DemoRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Demo } from "@/types";

export function DemoSection({ demos }: { demos: Demo[] }) {
  if (demos.length === 0) {
    return (
      <EmptyState title="No demos scheduled." description="Schedule a demo when discovery or presentation is complete." />
    );
  }

  return (
    <div className="grid gap-2">
      {demos.map((demo) => (
        <DemoRow key={demo.id} demo={demo} />
      ))}
    </div>
  );
}
