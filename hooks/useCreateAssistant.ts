import { useState } from "react";

export function useCreateAssistant() {
  const [agent, setAgent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAssistant = async (): Promise<any | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/createAssistant", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assistant");
      }

      const newAgent = await response.json();
      setAgent(newAgent);
      return newAgent;
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("An unknown error occurred"));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createAssistant, agent, isLoading, error };
}
