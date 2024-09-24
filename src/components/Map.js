import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import geojsonData from './countries.json'; // Ensure the GeoJSON file is available in your project
import PropTypes from 'prop-types';

const MapComponent = ({ theData }) => {
  const [countryDataMap, setCountryDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(theData) && theData.length > 0) {
      const mappedData = theData.reduce((acc, item) => {
        const countryCode = item["Country_Code"]?.trim().toUpperCase();
        if (countryCode && countryCode !== "WORLD") {
          const lastYearKey = Object.keys(item).filter(key => key.startsWith('Year_')).pop();
          const value = Number(item[lastYearKey]) || 0;
          acc[countryCode] = { year: lastYearKey.replace('Year_', ''), value };
        }
        return acc;
      }, {});

      setCountryDataMap(mappedData);
      setLoading(false);
    }
  }, [theData]);

  // Updated getColor function with specified ranges
  const getColor = (value) => {
    if (value <= -50) return '#008000'; // Green for -100 to -50
    if (value <= 0) return '#90EE90'; // Light Green for -49 to 0
    if (value <= 10) return '#FFFF00'; // Yellow for 1 to 10
    if (value <= 20) return '#FFA500'; // Orange for 11 to 20
    if (value <= 30) return '#FFCCCB'; // Light Red for 21 to 30
    if (value <= 40) return '#FF0000'; // Red for 31 to 40
    if (value <= 50) return '#B22222'; // Dark Red for 41 to 50
    if (value <= 60) return '#DC143C'; // Crimson for 51 to 60
    if (value <= 70) return '#FF4500'; // Firebrick for 61 to 70
    if (value <= 80) return '#FF6347'; // Tomato for 71 to 80
    if (value <= 90) return '#FF7F50'; // Coral for 81 to 90
    if (value <= 100) return '#FFB6C1'; // Light Coral for 91 to 100
    return 'gray'; // Default color for undefined values
  };

  const onEachFeature = (feature, layer) => {
    const geojsonCountryCode = feature.properties.ISO_A3;
    const countryData = countryDataMap[geojsonCountryCode];

    if (countryData) {
      const { value, year } = countryData;
      const tooltipContent = `
        <div>
          <strong>Country:</strong> ${feature.properties.ADMIN}<br/>
          <strong>Year:</strong> ${year}<br/>
          <strong>Value:</strong> ${value.toFixed(2)}
        </div>
      `;
      layer.bindTooltip(tooltipContent, {
        direction: 'auto',
        sticky: true,
        offset: [10, 0],
      }).openTooltip();
    } else {
      layer.options.fillOpacity = 0;
    }
  };

  const style = (feature) => {
    const geojsonCountryCode = feature.properties.ISO_A3;
    const value = countryDataMap[geojsonCountryCode]?.value;

    return {
      fillColor: value !== undefined ? getColor(value) : 'gray',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const renderLegend = () => {
    return (
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
        zIndex: '1000'
      }}>
        <h4>Legend</h4>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#008000', marginRight: '5px' }} />
            <div>-100 to -50</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#90EE90', marginRight: '5px' }} />
            <div>-49 to 0</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFF00', marginRight: '5px' }} />
            <div>1 to 10</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', marginRight: '5px' }} />
            <div>11 to 20</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFCCCB', marginRight: '5px' }} />
            <div>21 to 30</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', marginRight: '5px' }} />
            <div>31 to 40</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#B22222', marginRight: '5px' }} />
            <div>41 to 50</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#DC143C', marginRight: '5px' }} />
            <div>51 to 60</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FF4500', marginRight: '5px' }} />
            <div>61 to 70</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FF6347', marginRight: '5px' }} />
            <div>71 to 80</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FF7F50', marginRight: '5px' }} />
            <div>81 to 90</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#FFB6C1', marginRight: '5px' }} />
            <div>91 to 100</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON
        data={geojsonData}
        style={style}
        onEachFeature={onEachFeature}
      />
      {renderLegend()}
    </MapContainer>
  );
};

MapComponent.propTypes = {
  theData: PropTypes.array.isRequired,
};

export default MapComponent;
