import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About page',
};

export default function About() {
  return (
    <div>
      <h1>About</h1>
      <p>Welcome to the about page.</p>
    </div>
  );
}
