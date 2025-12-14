import './styles.css';
import { Space_Mono, Plus_Jakarta_Sans } from 'next/font/google';

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
    <html lang="en" className={`${spaceMono.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="grid min-h-screen font-mono bg-oatmeal-50 text-oatmeal-950">
        {children}
      </body>
    </html>
  );
};

export default Layout;
