import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <img
        src="https://yzscvkujys6lbqov.public.blob.vercel-storage.com/aava.jpeg"
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    ),
    { ...size }
  );
}
