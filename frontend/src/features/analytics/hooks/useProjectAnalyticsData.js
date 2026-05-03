import { getEarnings } from "@/features/earnings/services/earnings";
import { getExpenses } from "@/features/expenses/services/expenses";
import { getProjectById } from "@/features/projects/services/projects";
import { useEffect, useState } from "react";

export function useProjectAnalyticsData({ userId, projectId }) {
  const [project, setProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!userId || !projectId) {
        if (isMounted) {
          setProject(null);
          setExpenses([]);
          setEarnings([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const [projectResult, expensesResult, earningsResult] = await Promise.allSettled([
        getProjectById(projectId, { userId }),
        getExpenses({ userId, projectId }),
        getEarnings({ userId, projectId }),
      ]);

      if (!isMounted) return;

      if (projectResult.status === "rejected" && expensesResult.status === "rejected") {
        setProject(null);
        setExpenses([]);
        setEarnings([]);
        setError(projectResult.reason?.message || "Failed to load project analytics data");
        setIsLoading(false);
        return;
      }

      setProject(projectResult.status === "fulfilled" ? projectResult.value?.data || null : null);
      setExpenses(expensesResult.status === "fulfilled" ? expensesResult.value?.data || [] : []);
      setEarnings(earningsResult.status === "fulfilled" ? earningsResult.value?.data || [] : []);
      setError(null);
      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId, userId]);

  return { project, expenses, earnings, isLoading, error };
}
