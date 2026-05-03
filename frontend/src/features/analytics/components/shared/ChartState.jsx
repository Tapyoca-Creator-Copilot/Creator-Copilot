import { cn } from "@/lib/utils";

const ChartState = ({ title, description, className }) => {
  return (
    <div className={cn("rounded-lg border border-border/70 bg-muted/30 p-6", className)}>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
};

export default ChartState;
