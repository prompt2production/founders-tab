import { ArrowRight, Zap, Shield, Repeat } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Prompt2Production Starter
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A production-ready Next.js boilerplate for AI-driven development. 
            Build features while you sleep using the Ralph Wiggum workflow.
          </p>
        </div>

        {/* What is Prompt2Production */}
        <div className="rounded-lg border bg-white p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            What is Prompt2Production?
          </h2>
          <p className="text-slate-600 mb-4">
            <strong>Prompt2Production</strong> bridges the gap between &quot;vibe coding&quot; and professional 
            engineering. It&apos;s a methodology for building production-quality software using AI coding 
            assistants with proper discipline:
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Structured Workflows</h3>
              <p className="text-sm text-slate-500">Repeatable patterns that produce consistent, high-quality output</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Engineering Discipline</h3>
              <p className="text-sm text-slate-500">Testing, validation, design systems, and documentation built-in</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <Repeat className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Iterative Development</h3>
              <p className="text-sm text-slate-500">Let AI agents build features autonomously while you sleep</p>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="rounded-lg border bg-white p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            What&apos;s Included
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">Next.js 15 with App Router</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">PostgreSQL + Prisma ORM</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">shadcn/ui component library</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">Tailwind CSS styling</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">Vitest + Playwright testing</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">CLAUDE.md for AI context</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">DESIGN_SYSTEM.md for UI consistency</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700">Ralph workflow pre-configured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Next Steps</h2>
          <ol className="space-y-3 text-slate-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">1</span>
              <span>Update <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">prisma/schema.prisma</code> with your data models</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">2</span>
              <span>Run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">npx prisma migrate dev</code> to create your database</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">3</span>
              <span>Write your product requirements in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">PRD.md</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">4</span>
              <span>Create user stories in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">prd.json</code> with clear acceptance criteria</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">5</span>
              <span>Run Ralph and watch AI build your features</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          Built with the{' '}
          <a 
            href="https://prompt2production.com" 
            className="text-indigo-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prompt2Production
          </a>
          {' '}methodology
        </div>
      </div>
    </main>
  )
}
