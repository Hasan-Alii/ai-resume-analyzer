import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const [resumeImgUrl, setResumeImgUrl] = useState("");
  const { fs } = usePuterStore();

  useEffect(() => {
    const loadResume = async () => {
      // const resumeData = await fs.read(id);
      // let resumeUrl = URL.createObjectURL(resumeData);
      const resumeImageBlob = await fs.read(imagePath);
      if (!resumeImageBlob) return;
      let resumeImageUrl = URL.createObjectURL(resumeImageBlob);
      setResumeImgUrl(resumeImageUrl);
    };
    loadResume();
  }, [imagePath]);
  return (
    // resume review link (wraps all the resume card and info)
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000">
      {/* resume's job title and company name */}
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="!text-black font-bold break-words">{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
          )}
          {!companyName && !jobTitle && (
            <h2 className="!text-black font-bold">Resume</h2>
          )}
        </div>

        {/* resume's score circle */}
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {/* resume image */}
      {resumeImgUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeImgUrl}
              alt="resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      )}
    </Link>
  );
};
export default ResumeCard;
