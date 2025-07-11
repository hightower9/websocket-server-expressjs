export const validateChannelName = (channelName) => {
    if (!channelName || typeof channelName !== 'string') {
        return false;
    }
    return /^[a-zA-Z0-9_\-\.]+$/.test(channelName);
};

export const parseChannelType = (channelName) => {
    if (channelName.startsWith('private-')) return 'private';
    if (channelName.startsWith('presence-')) return 'presence';
    return 'public';
};

export const normalizeChannelName = (channelName) => {
    return channelName.replace(/^private-|^presence-/, '');
};

export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};