import { useCreateAssistant } from "@/hooks/useCreateAssistant";
import { Button } from "../ui/button";

export function CreateAssistant() {
  const { createAssistant, agent, isLoading, error } = useCreateAssistant();

  const handleCreateAssistant = async () => {
    await createAssistant();
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Create Letta Assistant</h2>
      <Button onClick={handleCreateAssistant} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Assistant"}
      </Button>

      {isLoading && <p className="mt-4">Creating your assistant...</p>}

      {error && <p className="mt-4 text-red-500">Error: {error.message}</p>}

      {agent && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Assistant Created:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(agent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
