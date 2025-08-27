window.CONFIG = {
    // Auto-detect API base URL based on environment
    API_BASE_URL: (() => {
        // For Chrome extension, use the Replit app URL
        return 'https://8b8b11fe-8b26-478c-833b-4cb2c7d9c3ca-00-1u6v7kw2cbj6z.worf.replit.dev';
    })(),
    
    // Extension settings
    SETTINGS: {
        AUTO_CAPTURE_ENABLED: false,
        DEFAULT_ANALYSIS_MODE: 'quick',
        DEFAULT_PRIORITY: 'normal',
        NOTIFICATION_ENABLED: true,
        STORAGE_LIMIT: 50 // Maximum stored captures
    }
};