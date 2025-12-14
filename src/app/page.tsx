import Link from 'next/link';

const HomePage = () => (
      <div className="flex gap-6">
        <Link href="/articles">
          Articles
        </Link>
        <Link href="/labs">
          Labs
        </Link>
      </div>
  );

export default HomePage;
