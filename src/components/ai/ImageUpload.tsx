import { useRef } from 'react';

export default function ImageUpload({ image, onUpload, onNewImage, analyzing, label }: { image: File | null; onUpload: (file: File) => void; onNewImage: () => void; analyzing: boolean; label?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!image ? (
        <>
          <label className="block mb-2 font-medium">{label || 'Upload a fridge photo or take a picture'}</label>
          <button className="btn btn-outline w-full" onClick={() => fileInputRef.current?.click()}>
            {label || 'Upload a fridge photo or take a picture'}
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        </>
      ) : (
        <div className="w-full flex flex-col items-center gap-2">
          <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-48 rounded shadow" />
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={onNewImage} disabled={analyzing}>Neues Bild wählen</button>
          </div>
          {analyzing && <div className="mt-2 text-green-600">Analyse läuft...</div>}
        </div>
      )}
    </div>
  );
}
