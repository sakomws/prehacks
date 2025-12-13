export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">
          Event Management Platform
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to the Event Management Platform
          </h2>
          <p className="text-lg text-muted-foreground">
            Create calendars, organize events, and build communities around shared interests.
          </p>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Create Events
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Organize and publish events with detailed information and registration management.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Discover Events
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Find interesting events through search, filtering, and category browsing.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Build Communities
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Create branded calendars and build communities around your events.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Manage Registrations
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Handle event registrations, payments, and attendee management.
          </p>
        </div>
      </div>
    </main>
  )
}