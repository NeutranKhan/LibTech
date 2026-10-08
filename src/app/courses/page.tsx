import { Header, Footer } from '@/components/public-shell';
import { Catalog } from '@/components/catalog';
import { catalog } from '@/server/catalog';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Explore courses' };
export default async function Courses() {
  return (
    <>
      <Header />
      <main className="wrap section">
        <span className="eyebrow">INVEST IN YOUR CURIOSITY</span>
        <h1 className="page-title">
          Small lessons.
          <br />
          Useful new skills.
        </h1>
        <p className="lead">Interactive courses for the things you want to do with AI.</p>
        <Catalog courses={await catalog()} />
      </main>
      <Footer />
    </>
  );
}
