import { useState } from "react";
import DanangGallery from "../../components/Gallery";
import { useGallery } from "../../hooks/gallery/useGallery";

function GalleryPage() {
  const { galleries, loading, error } = useGallery();
  const [selectedYear, setSelectedYear] = useState(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!galleries.length) return null;

  const currentGallery =
    galleries.find((g) => g.year === selectedYear) || galleries[0];
  const allImages = galleries.flatMap((g) =>
    (g.images || []).map((img) => ({ ...img, year: g.year }))
  );
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  console.log(currentGallery.images);
  console.log("all", allImages);
  return (
    <div className="bg-[#554b32]! w-screen h-screen p-2 flex flex-col items-center overflow-hidden">
      <h1 className="text-center font-bold text-2xl m-2 text-white">
        THƯ VIỆN ẢNH ĐÀ NẴNG
      </h1>

      {/* chọn năm */}
      {/* <select
        className="mb-4 px-2 py-1 border rounded"
        value={currentGallery.year}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
      >
        {galleries.map((g) => (
          <option key={g.year} value={g.year}>
            {g.year}
          </option>
        ))}
      </select> */}

      {/* spiral gallery */}
      <DanangGallery images={allImages} />
    </div>
  );
}
export default GalleryPage;
