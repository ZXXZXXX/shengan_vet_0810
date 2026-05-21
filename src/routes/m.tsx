import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/m")({
  head: () => ({ meta: [{ title: "奇点智牧 · 移动首页" }] }),
  component: () => <Outlet />,
});
