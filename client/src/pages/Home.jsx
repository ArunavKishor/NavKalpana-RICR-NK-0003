import React from "react";

const courses = [
  {
    title: "Java",
    detail: "Core Java to advanced enterprise patterns.",
  },
  {
    title: "Python",
    detail: "From fundamentals to automation and APIs.",
  },
  {
    title: "DSA",
    detail: "Data structures and algorithms for interviews.",
  },
  {
    title: "Web Development",
    detail: "Frontend, backend, and full-stack projects.",
  },
  {
    title: "Data Science",
    detail: "Statistics, analytics, and real datasets.",
  },
  {
    title: "Machine Learning",
    detail: "Models, evaluation, and deployment basics.",
  },
  {
    title: "Power BI",
    detail: "Dashboards, reports, and business insights.",
  },
];

const Home = () => {
  return (
    <div className="home-shell text-slate-900">
      <style>{`
				@import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Grotesk:wght@400;500;600;700&display=swap");

				.home-shell {
					--home-ink: #0f172a;
					--home-accent: #f97316;
					--home-accent-soft: #fde68a;
					--home-sky: #38bdf8;
					--home-sand: #fff7ed;
					--home-slate: #e2e8f0;
					font-family: "Space Grotesk", sans-serif;
					background: radial-gradient(circle at top left, #fef3c7, #ffffff 55%),
						radial-gradient(circle at 30% 20%, #e0f2fe, transparent 45%),
						linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #e0f2fe 100%);
				}

				.home-title {
					font-family: "DM Serif Display", serif;
				}

				.float-shape {
					animation: float 8s ease-in-out infinite;
				}

				.float-shape.delay {
					animation-delay: 1.5s;
				}

				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-12px);
					}
				}

				.fade-up {
					animation: fadeUp 0.9s ease both;
				}

				@keyframes fadeUp {
					from {
						opacity: 0;
						transform: translateY(18px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>

      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-200/60 rounded-full blur-3xl float-shape" />
        <div className="absolute top-24 -right-16 w-72 h-72 bg-sky-200/60 rounded-full blur-3xl float-shape delay" />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="fade-up">
              <p className="uppercase tracking-[0.3em] text-xs text-slate-500">
                NavKalpana Institute
              </p>
              <h1 className="home-title text-4xl sm:text-5xl lg:text-6xl mt-4 leading-tight">
                An edtech institute built to turn learners into creators.
              </h1>
              <p className="text-lg text-slate-600 mt-5 max-w-xl">
                We are an edtech company focused on job-ready skills,
                mentorship, and hands-on projects. Our programs combine modern
                curriculum, expert instructors, and real-world outcomes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-orange-600 transition">
                  Explore Courses
                </button>
                <button className="px-6 py-3 rounded-full font-semibold border border-slate-200 bg-white/70 backdrop-blur hover:border-slate-300 transition">
                  Talk to an Advisor
                </button>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Learners", value: "4,500+" },
                  { label: "Placement Focus", value: "98%" },
                  { label: "Mentors", value: "35+" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/80 rounded-2xl px-4 py-3 border border-white/60 shadow-sm"
                  >
                    <p className="text-2xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up">
              <div className="bg-white/80 rounded-3xl shadow-2xl border border-white/60 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  What we teach
                </p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                  Career-forward programs
                </h2>
                <p className="text-slate-600 mt-3">
                  Structured tracks with live classes, labs, and mock
                  interviews.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {courses.slice(0, 6).map((course) => (
                    <div
                      key={course.title}
                      className="rounded-2xl p-4 bg-slate-50 border border-slate-100"
                    >
                      <p className="font-semibold text-slate-900">
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {course.detail}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                  <p className="text-sm text-slate-600">
                    Also includes{" "}
                    <span className="font-semibold">Power BI</span>, career
                    counseling, and resume clinics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Learn by Doing",
              body: "Capstone projects and real datasets for every course.",
            },
            {
              title: "Mentorship-Driven",
              body: "Small batches with personalized guidance.",
            },
            {
              title: "Placement Support",
              body: "Mock interviews, referrals, and portfolio reviews.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-100 shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="text-slate-600 mt-3">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-slate-500">
              Courses
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Choose your learning path
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className="rounded-3xl p-6 bg-white shadow-lg border border-slate-100 hover:-translate-y-1 transition"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">
                {course.title[0]}
              </div>
              <h3 className="text-xl font-semibold mt-4 text-slate-900">
                {course.title}
              </h3>
              <p className="text-slate-600 mt-3">{course.detail}</p>
              <button className="mt-5 text-sm font-semibold text-orange-600">
                View curriculum →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-slate-900 text-white p-10 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="home-title text-3xl sm:text-4xl">
              Ready to join the next cohort?
            </h2>
            <p className="text-slate-200 mt-3 max-w-2xl">
              Start with a counseling session and get a personalized roadmap for
              Java, Python, DSA, Web Development, Data Science, Machine
              Learning, or Power BI.
            </p>
          </div>
          <button className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:bg-slate-100 transition">
            Book a free call
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
