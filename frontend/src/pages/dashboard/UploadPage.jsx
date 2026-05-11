import { useState, useRef, useEffect } from "react";
import { uploadDocument, getDocuments, deleteDocument } from "../../lib/api";
import {
  HiOutlineDocumentArrowUp,
  HiOutlineDocumentText,
  HiOutlineTrash,
} from "react-icons/hi2";

import bgImage from "../../assets/ai-bg.jpg";

export default function UploadPage() {
  const [docs, setDocs] = useState([]);
  const fileRef = useRef(null);
  const [type, setType] = useState("resume");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getDocuments()
      .then((d) => setDocs(d.documents || []))
      .catch(() => { });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadDocument(file, type);
      const d = await getDocuments();
      setDocs(d.documents || []);
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      setDeletingId(id);
      await deleteDocument(id);
      const d = await getDocuments();
      setDocs(d.documents || []);
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* GLOW */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-500/20 blur-[150px]" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-500/20 blur-[150px]" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-4xl mx-auto p-6">

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-8">
          📄 Upload Documents
        </h1>

        {/* UPLOAD CARD */}
        <div className="glass-card p-6 mb-8">

          {/* SELECT */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field mb-6 w-full"
          >
            <option value="resume">Resume (PDF/DOCX)</option>
            <option value="jd">Job Description (PDF/TXT)</option>
          </select>

          {/* UPLOAD ZONE */}
          <div
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-white/20 hover:border-blue-400/60 transition-all p-12 rounded-xl text-center bg-white/5 hover:bg-white/10"
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
            />

            <HiOutlineDocumentArrowUp className="text-6xl mx-auto mb-4 text-blue-400 animate-float-slow" />

            <p className="text-lg font-medium">
              Click to upload{" "}
              <span className="uppercase text-blue-400">{type}</span>
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Supports files up to 10MB
            </p>
          </div>
        </div>

        {/* DOCUMENT LIST */}
        {docs.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-6 text-xl">
              📂 Uploaded Documents
            </h3>

            <div className="space-y-4">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 transition rounded-xl border border-white/10"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                      <HiOutlineDocumentText className="text-2xl" />
                    </div>

                    <div>
                      <p className="font-medium truncate max-w-[220px] sm:max-w-md">
                        {d.filename}
                      </p>
                      <p className="text-xs text-blue-400 uppercase mt-1">
                        {d.doc_type}
                      </p>
                    </div>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
                    className="p-3 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                  >
                    {deletingId === d.id ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <HiOutlineTrash />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 0 30px rgba(0, 150, 255, 0.15);
        }

        @keyframes floatSlow {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}