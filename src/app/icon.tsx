import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const data = await fetch(
    "https://yzscvkujys6lbqov.public.blob.vercel-storage.com/aava.jpeg"
  ).then((res) => res.arrayBuffer());

  const src = `data:image/jpeg;base64,${Buffer.from(data).toString("base64")}`;

  return new ImageResponse(
    (
      <img
        src={src}
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
