import Navbar from "@/components/layout/Navbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col min-h-screen`}>
      <Navbar />
      <div className="grow mt-16">{children}</div>
    </div>
  );
}
