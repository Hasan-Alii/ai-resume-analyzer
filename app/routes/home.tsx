import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
// import { resumes } from "~/constants";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "San's Resume ِِAnalyzer" },
    { name: "description", content: "Your Career is one step away!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // if user logged in load home pageXOffset,
  // otherwise navigate to the auth page then redirect to home
  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
      console.log("parsedResumes", parsedResumes);
    };
    loadResumes();
  }, []);

  return (
    // Home Page Contents
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        {/* the heading of the home page */}
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <div>
              <h2>
                No uploaded resumes found, upload your resume now to get
                feedback for your next dream job!
              </h2>
            </div>
          ) : (
            <h2>Review your Submissions and check AI-powered feedback</h2>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/public/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {/* <iframe
          className="absolute width=100% height=100% z-index=999"
          src="https://chromedino.com/"
          scrolling="no"
          width="100%"
          height="100%"
          loading="lazy"></iframe> */}

        {/* fetched resumes*/}
        <div></div>
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold">
              Upload & Anlyse your Resume Now!
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
