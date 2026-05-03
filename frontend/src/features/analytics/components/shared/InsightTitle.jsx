import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const ICON_BY_DIRECTION = {
  down: ArrowDownRight,
  up: ArrowUpRight,
  flat: Minus,
  neutral: Minus,
};

const InsightTitle = ({ direction = "neutral", children }) => {
  const Icon = ICON_BY_DIRECTION[direction] || Minus;

  return (
    <>
      <Icon className="h-4 w-4" />
      {children}
    </>
  );
};

export default InsightTitle;
