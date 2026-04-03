import { Button } from "@/components/ui/button";

const GoogleMark = () => {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.31h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.88c2.27-2.09 3.55-5.17 3.55-8.67z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3.01c-1.08.73-2.45 1.17-4.05 1.17-3.11 0-5.74-2.1-6.68-4.92H1.31v3.11A12 12 0 0 0 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.32 14.34A7.2 7.2 0 0 1 4.95 12c0-.81.14-1.59.37-2.34V6.55H1.31A12 12 0 0 0 0 12c0 1.94.46 3.78 1.31 5.45l4.01-3.11z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.31 6.55l4.01 3.11C6.26 6.87 8.89 4.77 12 4.77z"
        fill="#EA4335"
      />
    </svg>
  );
};

export const GoogleAuthButton = ({ onClick, children }) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-10 w-full border border-[#dadce0] bg-white px-4 font-medium text-[#3c4043] shadow-none hover:bg-[#f8f9fa] hover:text-[#3c4043] dark:border-[#5f6368] dark:bg-[#131314] dark:text-[#e8eaed] dark:hover:bg-[#252526] dark:hover:text-[#e8eaed]"
    >
      <span className="flex w-full items-center justify-center gap-3">
        <GoogleMark />
        <span>{children}</span>
      </span>
    </Button>
  );
};
