import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface StatControlProps {
  statName: string;
  statKey: string;
  currentValue: number;
  onIncrement: (statKey: string) => void;
  onDecrement: (statKey: string) => void;
}

export default function StatControl({
  statName,
  statKey,
  currentValue,
  onIncrement,
  onDecrement,
}: StatControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase text-slate-700">
          {statName}
        </span>
        <Badge variant="secondary" className="text-base px-3">
          {currentValue}
        </Badge>
      </div>
      <div className="bg-slate-100 p-2 rounded-lg border text-center font-mono text-sm min-h-[36px] flex items-center justify-center">
        {"●".repeat(currentValue).split("").join(" ") || "-"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onDecrement(statKey)}
          variant="outline"
          className="h-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => onIncrement(statKey)}
          className="h-10 bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
