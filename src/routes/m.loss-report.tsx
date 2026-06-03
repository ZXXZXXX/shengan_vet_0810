import { createFileRoute } from "@tanstack/react-router";
import { DrugReportForm } from "@/components/m/drug-report-form";

export const Route = createFileRoute("/m/loss-report")({
  head: () => ({ meta: [{ title: "损耗上报 · 奇点智牧" }] }),
  component: () => <DrugReportForm mode="loss" />,
});
