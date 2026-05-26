import { ImgHTMLAttributes, useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/signedUrl";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  path: string;
  expiresIn?: number;
};

export function SignedImg({ path, expiresIn, ...rest }: Props) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl("");
      return;
    }
    getSignedUrl(path, expiresIn)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [path, expiresIn]);

  return <img src={url} {...rest} />;
}
