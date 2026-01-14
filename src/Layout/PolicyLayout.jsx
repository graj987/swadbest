function PolicyLayout({ title, lastUpdated, children }) {
  return (
    <main className="bg-white text-gray-800">
      <section className="max-w-4xl mx-auto px-5 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: {lastUpdated}
        </p>

        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          {children}
        </div>
      </section>
    </main>
  );
}
export default PolicyLayout
