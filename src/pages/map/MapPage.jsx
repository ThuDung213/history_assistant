// src/pages/map/MapPage.jsx
import React from 'react';
import DanangMap from '../../components/Map/index';
import { useLocations } from '../../hooks/locations/useLocations';

function MapPage() {
    const {locations, loading} = useLocations();
    
    return (
        <div className='relative w-full h-full min-h-dvh md:min-h-0'>
            {loading ? <p>Đang tải dữ liệu...</p> : <DanangMap locations={locations} />}
        </div>
    );

}
export default MapPage;