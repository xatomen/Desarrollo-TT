export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      Navbar
      {children}
      Footer
    </div>
  );
}
