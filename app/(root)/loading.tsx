const Loading = () => {
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-md bg-milo-line/70" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-milo-line/50" />
          </div>
          <div className="h-32 w-full animate-pulse rounded-xl border border-milo-line bg-milo-panel/70 shadow-chart" />
        </header>

        <section className="recent-transactions">
          <header className="flex items-center justify-between">
            <div className="h-6 w-44 animate-pulse rounded-md bg-milo-line/70" />
            <div className="h-5 w-16 animate-pulse rounded-md bg-milo-line/50" />
          </header>
          <div className="flex gap-3">
            <div className="h-14 flex-1 animate-pulse rounded-xl border border-milo-line bg-milo-panel/70" />
            <div className="h-14 flex-1 animate-pulse rounded-xl border border-milo-line bg-milo-panel/70" />
          </div>
          <div className="h-20 animate-pulse rounded-xl border border-milo-line bg-milo-panel/70" />
          <div className="h-[420px] animate-pulse rounded-xl border border-milo-line bg-milo-panel/70" />
        </section>
      </div>

      <aside className="right-sidebar">
        <div className="h-48 animate-pulse rounded-xl bg-milo-line/50" />
        <div className="mt-8 h-56 animate-pulse rounded-xl border border-milo-line bg-milo-panel/70" />
      </aside>
    </section>
  );
};

export default Loading;
