import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
// import DinoGame from "react-chrome-dino-ts"; // Uncomment if you need to use DinoGame

const Upload = () => {
  const { auth, fs, isLoading, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("No file uploaded");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/upload");
  }, [auth.isAuthenticated]);

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading your resume...");

    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) {
      console.log("Error: Failed to upload your resume! :(");
      return setStatusText("Error: Failed to upload your resume!");
    }

    console.log("Converting your resume to image...");
    setStatusText("Converting your resume to image...");

    const imgFile = await convertPdfToImage(file);
    if (!imgFile) {
      console.log("Error: Failed to convert your resume to an image! :(");

      return setStatusText("Error: Failed to convert your resume to an image!");
    }

    setStatusText("Uploading resume image...");

    if (!imgFile.file) {
      setStatusText("Error: Failed to get image file from PDF conversion!");
      console.log("Error: Failed to get image file from PDF conversion!");
      setIsProcessing(false);
      return;
    }
    const uploadedImage = await fs.upload([imgFile.file]);
    if (!uploadedImage) {
      console.log("Error: Failed to upload your resume image!");

      return setStatusText("Error: Failed to upload your resume image!");
    }
    console.log("Preparing data...");

    setStatusText("Preparing data...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      companyName,
      jobTitle,
      jobDescription,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      feedback: "",
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    console.log("Analyzing...");

    setStatusText("Analyzing...");

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) {
      console.log("Error: Failed to analyze your resume! :(");
      return setStatusText("Error: Failed to analyze your resume! :(");
    }
    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    console.log("Your Analysis is Complete!, redirecting...");
    setStatusText("Your Analysis is Complete!, redirecting...");
    console.log(data);
    navigate(`/resume/${uuid}`);
  };

  const handleResumeUpload = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    if (!file) return;
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Professional Feedback for your Next Job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                alt="scanning resume"
                className="w-full"
              />
              {/* <DinoGame/> */}
            </>
          ) : (
            <>
              <h2>
                Upload your Resume Here (drop here) to get ATS score and
                improvements!
              </h2>
            </>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              className="flex flex-col gap-4 mt-8"
              onSubmit={handleResumeUpload}>
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={6}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button type="submit" className="primary-button">
                Upload & Analyze!
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
