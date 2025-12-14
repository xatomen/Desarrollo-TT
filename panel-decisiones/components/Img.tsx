import React, { ImgHTMLAttributes } from 'react';
import { getAssetPath } from '@/lib/getAssetPath';

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

/**
 * Componente Image wrapper que automáticamente agrega basePath a las rutas
 */
export const Img = ({ src, ...props }: ImgProps) => {
  const assetPath = src.startsWith('/') ? getAssetPath(src) : src;
  return <img src={assetPath} {...props} />;
};
