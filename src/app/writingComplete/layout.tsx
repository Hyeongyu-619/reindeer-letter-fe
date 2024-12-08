"use client";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C396C2] to-[#7BA1D2]">
      {children}
    </div>
  );
}
