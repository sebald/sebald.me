import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';

import { Navigation } from '@/ui/navigation';

import './styles.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const Layout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang="en" className={`${spaceMono.variable} ${plusJakarta.variable}`}>
      <body className="bg-oatmeal-50 text-oatmeal-950 relative isolate grid min-h-screen grid-rows-[auto_1fr_auto] font-mono">
        <Navigation />
        <main>{children}</main>
        <footer>TODO</footer>
      </body>
    </html>
  );
};

export default Layout;
