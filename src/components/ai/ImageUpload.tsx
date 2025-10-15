import { useRef } from 'react';

export default function ImageUpload({ image, onUpload, onNewImage, analyzing, label }: { image: File | null; onUpload: (file: File) => void; onNewImage: () => void; analyzing: boolean; label?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {!image ? (
        <>
          <label className="block mb-2 font-medium text-center w-full text-lg text-gray-200">{label || ''}</label>
          <button
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-primary bg-[#232b3e] text-primary font-semibold shadow hover:bg-primary hover:text-white transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2l.4-1.2A2 2 0 017.2 4h9.6a2 2 0 011.8 1.2L21 7h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm0 0V5a2 2 0 012-2h14a2 2 0 012 2v2" /><circle cx="12" cy="13" r="4" /></svg>
            <span>Upload or take a photo</span>
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        </>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-48 rounded shadow border-2 border-primary" />
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 bg-white text-primary font-semibold  hover:text-red-400 transition" onClick={onNewImage} disabled={analyzing}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v1.382a2 2 0 001.447 1.342L9 10m6 0v4m0 0l-4 4m4-4l4-4" /></svg>
              <span>Choose new image</span>
            </button>
          </div>
          {analyzing && <div className="mt-2 text-green-400">Analyzing image...</div>}
        </div>
      )}
    </div>
  );
}
