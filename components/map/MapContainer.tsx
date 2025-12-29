import { forwardRef } from 'react';

interface MapContainerProps {
  className?: string;
}

export const MapContainer = forwardRef<HTMLDivElement, MapContainerProps>(
  ({ className }, ref) => {
    return <div ref={ref} className={className} />;
  }
);

MapContainer.displayName = 'MapContainer';

