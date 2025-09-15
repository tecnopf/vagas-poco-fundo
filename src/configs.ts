if (!import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL is not defined in environment variables");
}

export const API_URL: string = import.meta.env.VITE_API_URL;

