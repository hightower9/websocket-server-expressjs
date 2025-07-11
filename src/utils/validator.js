export const validateBroadcastData = (data) => {
    if (!data) return { valid: false, error: 'Data is required' };
    if (!data.channel || typeof data.channel !== 'string') {
        return { valid: false, error: 'Valid channel is required' };
    }
    if (!data.event || typeof data.event !== 'string') {
        return { valid: false, error: 'Valid event is required' };
    }
    return { valid: true };
};

export const validateNotificationData = (data) => {
    if (!data) return { valid: false, error: 'Data is required' };
    if (!data.userId || typeof data.userId !== 'string') {
        return { valid: false, error: 'Valid user ID is required' };
    }
    if (!data.event || typeof data.event !== 'string') {
        return { valid: false, error: 'Valid event is required' };
    }
    return { valid: true };
};