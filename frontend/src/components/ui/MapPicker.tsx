import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import styles from './MapPicker.module.css';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState({ lat: latitude || 12.9716, lng: longitude || 77.5946 });

  // Mock locations for "Set Current Location"
  const handleQuickLoc = () => {
    // Center of Bangalore (Sticho default context)
    const lat = 12.9716 + (Math.random() - 0.5) * 0.05;
    const lng = 77.5946 + (Math.random() - 0.5) * 0.05;
    onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
  };

  const handleOpenMap = () => {
    setTempCoords({ lat: latitude || 12.9716, lng: longitude || 77.5946 });
    setIsModalOpen(true);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    // Convert click position (0 to 100%) to latitude and longitude coordinates
    // Map bounding box: Bangalore approx Lat: 12.90 to 13.04, Lng: 77.50 to 77.70
    const latMin = 12.9000;
    const latMax = 13.0400;
    const lngMin = 77.5000;
    const lngMax = 77.7000;

    const percentX = x / rect.width;
    const percentY = y / rect.height;

    const lat = latMax - percentY * (latMax - latMin);
    const lng = lngMin + percentX * (lngMax - lngMin);

    setTempCoords({
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    });
  };

  const handleConfirm = () => {
    onChange(tempCoords.lat, tempCoords.lng);
    setIsModalOpen(false);
  };

  // Convert coordinates to dot position % on the map box
  const getPinStyle = () => {
    const latMin = 12.9000;
    const latMax = 13.0400;
    const lngMin = 77.5000;
    const lngMax = 77.7000;

    const top = ((latMax - tempCoords.lat) / (latMax - latMin)) * 100;
    const left = ((tempCoords.lng - lngMin) / (lngMax - lngMin)) * 100;

    return {
      top: `${Math.max(0, Math.min(100, top))}%`,
      left: `${Math.max(0, Math.min(100, left))}%`,
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputsRow}>
        <Input 
          label="Latitude" 
          type="number" 
          step="0.000001" 
          value={latitude !== null ? latitude : ''} 
          onChange={e => onChange(parseFloat(e.target.value) || 0, longitude || 0)} 
          placeholder="e.g. 12.9716"
        />
        <Input 
          label="Longitude" 
          type="number" 
          step="0.000001" 
          value={longitude !== null ? longitude : ''} 
          onChange={e => onChange(latitude || 0, parseFloat(e.target.value) || 0)} 
          placeholder="e.g. 77.5946"
        />
      </div>
      
      <div className={styles.buttonsRow}>
        <Button variant="secondary" type="button" onClick={handleOpenMap}>
          🗺️ Pick on Map
        </Button>
        <Button variant="secondary" type="button" onClick={handleQuickLoc}>
          📍 Set Current Location
        </Button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Select Location Map Pin</h3>
            <p className={styles.modalSubtitle}>Click anywhere on the area below to drop your business location pin.</p>
            
            <div className={styles.mapContainer} onClick={handleMapClick}>
              {/* Grid-based abstract mock map layout */}
              <div className={styles.mapGrid}>
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={styles.mapGridCell} />
                ))}
              </div>
              
              {/* Mock streets/routes */}
              <div className={styles.mockRoadH1} />
              <div className={styles.mockRoadH2} />
              <div className={styles.mockRoadV1} />
              <div className={styles.mockRoadV2} />
              <div className={styles.mockLake} />

              <div className={styles.pin} style={getPinStyle()}>
                <span className={styles.pinIcon}>📍</span>
                <span className={styles.pinPulse} />
              </div>
            </div>

            <div className={styles.coordsDisplay}>
              <span>Selected Coordinates:</span>
              <strong>{tempCoords.lat}, {tempCoords.lng}</strong>
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="button" onClick={handleConfirm}>Confirm Pin</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
