import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Undo2 } from "lucide-react";

interface PointsControlsProps {
  currentPoints: number;
  pointsString: string;
  onIncrementPoint: (points: number) => void;
  onDecrementPoint: () => void;
}

export default function PointsControls({
  currentPoints,
  pointsString,
  onIncrementPoint,
  onDecrementPoint,
}: PointsControlsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold uppercase text-slate-700">
          Points
        </span>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {currentPoints}
        </Badge>
      </div>
      <div className="bg-slate-100 p-3 rounded-lg border text-center font-mono text-sm min-h-[40px] flex items-center justify-center">
        {pointsString.split("").join(" ") || "-"}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onIncrementPoint(2)}
          className="h-14 text-base font-semibold bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-5 w-5" />2 Points
        </Button>
        <Button
          onClick={() => onIncrementPoint(3)}
          className="h-14 text-base font-semibold bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="mr-2 h-5 w-5" />3 Points
        </Button>
        <Button
          onClick={() => onIncrementPoint(1)}
          className="h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Free Throw
        </Button>
        <Button
          onClick={onDecrementPoint}
          variant="destructive"
          className="h-14 text-base font-semibold"
        >
          <Undo2 className="mr-2 h-5 w-5" />
          Undo
        </Button>
      </div>
    </div>
  );
}
