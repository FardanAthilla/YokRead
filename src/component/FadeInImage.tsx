import { useState } from "react";

const FadeInImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`w-full object-contain select-none transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      loading="lazy"
    />
  );
};

export default FadeInImage;
