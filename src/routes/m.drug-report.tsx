import { createFileRoute } from "@tanstack/react-router";
import { DrugReportForm } from "@/components/m/drug-report-form";

export const Route = createFileRoute("/m/drug-report")({
  head: () => ({ meta: [{ title: "药品上报 · 奇点智牧" }] }),
  component: () => <DrugReportForm />,
});
