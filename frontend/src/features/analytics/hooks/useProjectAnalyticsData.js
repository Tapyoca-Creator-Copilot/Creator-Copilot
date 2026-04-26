import { getExpenses } from "@/features/expenses/services/expenses";
import { getProjectById } from "@/features/projects/services/projects";
import { useEffect, useState } from "react";

export function useProjectAnalyticsData({ userId, projectId }) {
  const [project, setProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!userId || !projectId) {
        if (isMounted) {
          setProject(null);
          setExpenses([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [projectResponse, expensesResponse] = await Promise.all([
          getProjectById(projectId, { userId }),
          getExpenses({ userId, projectId }),
        ]);

        if (!isMounted) {
          return;
        }

        setProject(projectResponse?.data || null);
        setExpenses(expensesResponse?.data || []);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setProject(null);
        setExpenses([]);
        setError(err?.message || "Failed to load project analytics data");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId, userId]);

  return { project, expenses, isLoading, error };
}
