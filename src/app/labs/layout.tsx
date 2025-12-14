import Link from 'next/link';

const Layout = ({ children }: LayoutProps<'/labs'>) => {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b border-gray-200 py-4 px-6">
        <Link href="/" className="text-lg font-bold hover:opacity-75">
          Home
        </Link>
      </nav>
      <div className="flex-1 flex">
        <main className="flex-1 max-w-3xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
