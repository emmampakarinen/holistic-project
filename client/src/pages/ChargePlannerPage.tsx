import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Sheet, Typography } from '@mui/joy';

export default function ChargeJourneyPage() {
    const location = useLocation();
    
    const chargerResults = location.state?.chargerData;

    if (!chargerResults) {
        return (
            <div className="p-8 text-center">
                <Typography level="h3" color="danger">
                    No trip data found!
                </Typography>
                <Typography level="body-md">
                    Please submit your trip details first.
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Typography level="h2" className="font-bold mb-4">
                Raw JSON Output from Backend
            </Typography>
            
            <Card variant="outlined">
                <Typography level="title-md" className="mb-2">
                    Data Received:
                </Typography>
                
                <Sheet
                    variant="soft"
                    sx={{ 
                        p: 2, 
                        borderRadius: 'md', 
                        overflowX: 'auto', 
                        fontSize: '12px',
                        backgroundColor: 'neutral.softBg' 
                    }}
                >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(chargerResults, null, 2)}
                    </pre>
                </Sheet>
            </Card>
        </div>
    );
}