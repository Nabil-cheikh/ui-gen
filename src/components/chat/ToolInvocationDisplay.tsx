import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
  toolCallId: string;
}

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

function getFilename(path: string): string {
  return path.split("/").pop() || path;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;
  const command = args.command as string | undefined;
  const path = args.path as string | undefined;
  const filename = path ? getFilename(path) : "";

  if (toolName === "str_replace_editor" && command) {
    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
        return `Editing ${filename}`;
      case "insert":
        return `Editing ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      case "undo_edit":
        return `Undoing edit to ${filename}`;
    }
  }

  if (toolName === "file_manager" && command) {
    switch (command) {
      case "rename": {
        const newPath = args.new_path as string | undefined;
        const newFilename = newPath ? getFilename(newPath) : "";
        return `Renaming ${filename} → ${newFilename}`;
      }
      case "delete":
        return `Deleting ${filename}`;
    }
  }

  return toolName;
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const label = getLabel(toolInvocation);
  const isComplete = toolInvocation.state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-sans border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
