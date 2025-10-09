/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Allow images served from Supabase public buckets
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
                port: '',
                pathname: '/storage/v1/**',
            },
        ],
    },
};

module.exports = nextConfig;
