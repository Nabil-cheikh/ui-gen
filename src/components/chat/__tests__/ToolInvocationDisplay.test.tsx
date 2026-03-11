import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

function makeTool(overrides: Record<string, unknown> = {}) {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/App.tsx" },
    state: "result",
    result: "Success",
    ...overrides,
  };
}

test("renders 'Creating {filename}' for str_replace_editor create", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        args: { command: "create", path: "/components/App.tsx" },
      })}
    />
  );
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

test("renders 'Editing {filename}' for str_replace_editor str_replace", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        args: { command: "str_replace", path: "/components/Button.tsx" },
      })}
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("renders 'Editing {filename}' for str_replace_editor insert", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        args: { command: "insert", path: "/lib/utils.ts" },
      })}
    />
  );
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("renders 'Viewing {filename}' for str_replace_editor view", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        args: { command: "view", path: "/components/Card.tsx" },
      })}
    />
  );
  expect(screen.getByText("Viewing Card.tsx")).toBeDefined();
});

test("renders 'Undoing edit to {filename}' for undo_edit", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        args: { command: "undo_edit", path: "/components/App.tsx" },
      })}
    />
  );
  expect(screen.getByText("Undoing edit to App.tsx")).toBeDefined();
});

test("renders 'Renaming {old} → {new}' for file_manager rename", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/components/Old.tsx",
          new_path: "/components/New.tsx",
        },
      })}
    />
  );
  expect(screen.getByText("Renaming Old.tsx → New.tsx")).toBeDefined();
});

test("renders 'Deleting {filename}' for file_manager delete", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        toolName: "file_manager",
        args: { command: "delete", path: "/components/Trash.tsx" },
      })}
    />
  );
  expect(screen.getByText("Deleting Trash.tsx")).toBeDefined();
});

test("shows spinner when state is not result", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({ state: "call", result: undefined })}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is result", () => {
  const { container } = render(
    <ToolInvocationDisplay toolInvocation={makeTool({ state: "result" })} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("falls back to raw tool name for unknown tools", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        toolName: "unknown_tool",
        args: {},
      })}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("extracts filename from full path", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={makeTool({
        args: { command: "create", path: "/deeply/nested/dir/Component.tsx" },
      })}
    />
  );
  expect(screen.getByText("Creating Component.tsx")).toBeDefined();
});
