// src/pages/HomePage.jsx
import React from 'react';
import DanangMap from '../../components/Map';
import { useLocations } from '../../hooks/locations/useLocations';

function MapPage() {
    const {locations, loading} = useLocations();
    
    return (
        <div className='size-full'>
            {loading ? <p>Đang tải dữ liệu...</p> : <DanangMap locations={locations} />}
        </div>
    );

}
export default MapPage;