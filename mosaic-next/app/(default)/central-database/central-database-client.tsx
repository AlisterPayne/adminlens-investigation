"use client";

import ApplicationsView, { ApplicationItem, ApplicationScope } from "@/components/applications-view";

export type { ApplicationItem, ApplicationScope };

interface Props {
  initialApps: ApplicationItem[];
}

export default function CentralDatabaseClient({ initialApps }: Props) {
  return <ApplicationsView initialApps={initialApps} isBackend={true} />;
}
