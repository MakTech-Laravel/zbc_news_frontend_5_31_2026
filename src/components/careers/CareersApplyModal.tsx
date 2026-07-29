import { useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

import type { JobListing } from "@/components/careers/careersData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitCareerApplication } from "@/services/frontend/careers";

const RESUME_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_RESUME_BYTES = 20 * 1024 * 1024;

type CareersApplyModalProps = {
  job: JobListing | null;
  open: boolean;
  onClose: () => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CareersApplyModal({ job, open, onClose }: CareersApplyModalProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open || !job) return null;

  function pickResume(file: File | null | undefined) {
    if (!file) {
      setResume(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "doc", "docx"];
    if (!extension || !allowed.includes(extension)) {
      toast.error("Please upload a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast.error("Resume must be 20MB or smaller.");
      return;
    }

    setResume(file);
  }

  function clearResume() {
    setResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!job?.numericId) {
      toast.error("This job cannot accept applications yet.");
      return;
    }
    if (!resume) {
      toast.error("Please upload your resume / CV.");
      return;
    }

    setSubmitting(true);
    try {
      await submitCareerApplication({
        career_job_id: job.numericId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        cover_letter: coverLetter.trim() || undefined,
        resume,
      });
      toast.success("Application submitted successfully.");
      setName("");
      setEmail("");
      setPhone("");
      setCoverLetter("");
      clearResume();
      onClose();
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="careers-apply-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zbc-gray-200 px-6 py-4">
          <div>
            <h2
              id="careers-apply-title"
              className="text-lg font-bold text-zbc-gray-1000"
            >
              Apply for {job.title}
            </h2>
            <p className="mt-1 text-sm text-admin-label">
              {job.department} · {job.type} · {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-admin-label hover:bg-zbc-gray-50"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Full name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={190}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Phone (optional)</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">
              Cover letter (optional)
            </span>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[120px] w-full rounded-lg border border-zbc-gray-200 px-3 py-2 text-sm"
              maxLength={10000}
            />
          </label>

          <div className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">
              Resume / CV (PDF, DOC, DOCX · max 20MB)
            </span>

            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={RESUME_ACCEPT}
              className="sr-only"
              onChange={(e) => pickResume(e.target.files?.[0])}
            />

            {resume ? (
              <div className="flex items-center gap-3 rounded-xl border border-zbc-blue/25 bg-zbc-blue/5 px-4 py-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-zbc-blue shadow-sm">
                  <FileText className="size-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zbc-gray-1000">
                    {resume.name}
                  </p>
                  <p className="mt-0.5 text-xs text-admin-label">
                    {formatFileSize(resume.size)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zbc-blue hover:bg-white"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={clearResume}
                    className="rounded-lg p-1.5 text-admin-label hover:bg-white hover:text-zbc-gray-1000"
                    aria-label="Remove resume"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor={fileInputId}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickResume(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                  dragging
                    ? "border-zbc-blue bg-zbc-blue/5"
                    : "border-zbc-gray-200 bg-zbc-gray-50 hover:border-zbc-blue/50 hover:bg-white",
                )}
              >
                <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-white text-zbc-blue shadow-sm">
                  <Upload className="size-5" strokeWidth={2.25} />
                </span>
                <span className="text-sm font-semibold text-zbc-gray-1000">
                  Drop your resume here, or{" "}
                  <span className="text-zbc-blue underline-offset-2 hover:underline">
                    browse
                  </span>
                </span>
                <span className="mt-1.5 text-xs text-admin-label">
                  PDF, DOC, or DOCX up to 20MB
                </span>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
