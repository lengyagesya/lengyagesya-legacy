import { DocumentBuilder } from "../components";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  return <DocumentBuilder initialType={params.type || ""} />;
}
