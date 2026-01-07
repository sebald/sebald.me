import type { Metadata } from 'next';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'About',
  description: 'About page',
};

// Page
// ---------------
export default function About() {
  return (
    <div>
      <h1>About</h1>
      <p>Welcome to the about page.</p>
    </div>
  );
}
