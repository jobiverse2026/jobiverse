export default function JobsLoading() {
  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-[1450px] animate-pulse">
        <div className="h-5 w-32 rounded-full bg-zinc-200" />
        <section className="mt-7 rounded-[3rem] bg-zinc-900 px-7 py-14 sm:px-12">
          <div className="h-6 w-44 rounded-full bg-white/10" />
          <div className="mt-8 h-14 max-w-4xl rounded-2xl bg-white/10 sm:h-20" />
          <div className="mt-5 h-5 max-w-2xl rounded-full bg-white/10" />
        </section>
        <div className="relative -mt-5 mx-auto max-w-6xl rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-13 rounded-xl bg-zinc-100" />)}
          </div>
          <div className="mt-4 h-20 rounded-2xl bg-zinc-50" />
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-80 rounded-[2rem] border border-zinc-200 bg-white" />)}
        </div>
      </div>
    </main>
  );
}
