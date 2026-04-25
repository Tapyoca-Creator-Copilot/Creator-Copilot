const getGreetingByHour = (hour) => {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
};

export const getSessionDisplayName = (session) => {
  const metadata = session?.user?.user_metadata || {};
  const rawName =
    metadata.full_name ||
    metadata.name ||
    metadata.first_name ||
    metadata.given_name ||
    null;

  if (typeof rawName !== "string") {
    return null;
  }

  const trimmed = rawName.trim();
  return trimmed.length ? trimmed : null;
};

export const buildDashboardGreeting = ({ date = new Date(), name } = {}) => {
  const hour = date.getHours();
  const baseGreeting = getGreetingByHour(hour);
  const cleanedName = typeof name === "string" ? name.trim() : "";

  if (!cleanedName) {
    return baseGreeting;
  }

  return `${baseGreeting}, ${cleanedName}`;
};
