import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "../main-content";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat Interface</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

// Mock context providers (render children as-is)
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useChat: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders Preview tab as active by default", () => {
  render(<MainContent />);

  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  const codeTrigger = screen.getByRole("tab", { name: "Code" });

  expect(previewTrigger.getAttribute("data-state")).toBe("active");
  expect(codeTrigger.getAttribute("data-state")).toBe("inactive");
});

test("shows PreviewFrame and hides code view by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("file-tree")).toBeNull();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("switches to code view when Code tab is clicked", () => {
  render(<MainContent />);

  fireEvent.click(screen.getByRole("tab", { name: "Code" }));

  const codeTrigger = screen.getByRole("tab", { name: "Code" });
  const previewTrigger = screen.getByRole("tab", { name: "Preview" });

  expect(codeTrigger.getAttribute("data-state")).toBe("active");
  expect(previewTrigger.getAttribute("data-state")).toBe("inactive");
  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("switches back to preview view when Preview tab is clicked after Code", () => {
  render(<MainContent />);

  fireEvent.click(screen.getByRole("tab", { name: "Code" }));
  fireEvent.click(screen.getByRole("tab", { name: "Preview" }));

  const previewTrigger = screen.getByRole("tab", { name: "Preview" });
  const codeTrigger = screen.getByRole("tab", { name: "Code" });

  expect(previewTrigger.getAttribute("data-state")).toBe("active");
  expect(codeTrigger.getAttribute("data-state")).toBe("inactive");
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("file-tree")).toBeNull();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("renders chat interface in the left panel", () => {
  render(<MainContent />);

  expect(screen.getByTestId("chat-interface")).toBeDefined();
  expect(screen.getByText("React Component Generator")).toBeDefined();
});
