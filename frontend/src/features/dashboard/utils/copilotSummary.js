const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getProjectProgress = (project) => {
  const start = parseDate(project?.startDate || project?.start_date);
  const end = parseDate(project?.endDate || project?.end_date);

  if (!start || !end || end <= start) {
    return null;
  }

  const now = new Date();
  const elapsed = now.getTime() - start.getTime();
  const duration = end.getTime() - start.getTime();
  const percent = Math.min(100, Math.max(0, (elapsed / duration) * 100));
  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  return {
    percent,
    daysRemaining,
  };
};

export const buildCopilotSummary = ({
  project,
  budgetAmount,
  spentAmount,
  totalEarnings,
  netProfit,
  profitMargin,
  budgetUsedPercent,
  earningsCount,
  expensesCount,
  topDepartment,
  topEarningSource,
  formatMoney,
}) => {
  if (!project) return [];

  const bullets = [];
  const progress = getProjectProgress(project);

  if (progress) {
    const progressLabel = `${progress.percent.toFixed(0)}% through the project timeline`;
    if (progress.daysRemaining > 0) {
      bullets.push(
        `${progressLabel}, with ${progress.daysRemaining} day${progress.daysRemaining !== 1 ? "s" : ""} remaining. Use the remaining window to compare planned costs against expected earnings.`
      );
    } else {
      bullets.push(
        `${progressLabel}. The project is at or past its scheduled end date, so profitability and final cleanup should be the priority.`
      );
    }
  }

  if (budgetAmount > 0) {
    if (budgetUsedPercent >= 100) {
      bullets.push(
        `Expenses are over budget: ${formatMoney(spentAmount)} spent against a ${formatMoney(budgetAmount)} ceiling. Review the largest cost drivers before adding new spend.`
      );
    } else if (budgetUsedPercent > 80) {
      bullets.push(
        `Budget pressure is rising at ${budgetUsedPercent.toFixed(0)}% used, leaving ${formatMoney(Math.max(0, budgetAmount - spentAmount))}. Upcoming expenses should be tied to clear earning upside.`
      );
    } else {
      bullets.push(
        `Expenses are controlled: ${budgetUsedPercent.toFixed(0)}% of the budget is used, with ${formatMoney(Math.max(0, budgetAmount - spentAmount))} still available.`
      );
    }
  } else if (spentAmount > 0) {
    bullets.push(
      `${formatMoney(spentAmount)} has been spent across ${expensesCount} expense${expensesCount !== 1 ? "s" : ""}. Add a budget ceiling if you want Copilot to track burn rate and remaining room.`
    );
  }

  if (earningsCount > 0) {
    if (netProfit > 0) {
      bullets.push(
        `Profitability is positive: ${formatMoney(netProfit)} net profit on ${formatMoney(totalEarnings)} in earnings, a ${profitMargin.toFixed(0)}% margin.`
      );
    } else if (netProfit === 0) {
      bullets.push(`The project is exactly at break-even: ${formatMoney(totalEarnings)} earned matches logged expenses.`);
    } else {
      bullets.push(
        `The project is ${formatMoney(Math.abs(netProfit))} below break-even. Earnings need to catch up before the project becomes profitable.`
      );
    }
  } else if (spentAmount > 0) {
    bullets.push(`No earnings are logged yet, so expenses are currently carrying the whole project. Add expected or received earnings to reveal the path to break-even.`);
  }

  if (topDepartment) {
    bullets.push(
      `${topDepartment.name} is the largest expense concentration at ${formatMoney(topDepartment.amount)} (${topDepartment.share} of total expenses). This is the first place to inspect if costs feel high.`
    );
  }

  if (topEarningSource) {
    bullets.push(
      `${topEarningSource.name} is the strongest earning source at ${formatMoney(topEarningSource.amount)} (${topEarningSource.share} of earnings). Lean into this source if it is repeatable.`
    );
  }

  if (expensesCount === 0 && earningsCount === 0) {
    bullets.push(`No financial activity has been logged yet. Add expenses and earnings to unlock trend, budget, and profit guidance.`);
  } else {
    const parts = [];
    if (expensesCount > 0) parts.push(`${expensesCount} expense${expensesCount !== 1 ? "s" : ""}`);
    if (earningsCount > 0) parts.push(`${earningsCount} earning${earningsCount !== 1 ? "s" : ""}`);
    bullets.push(`${parts.join(" and ")} are recorded in the project range, giving Copilot enough context to track financial movement over time.`);
  }

  return bullets.slice(0, 5);
};
