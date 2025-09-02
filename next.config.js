/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disable ESLint during builds
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Keep TypeScript checking enabled
        ignoreBuildErrors: false,
    },
}

module.exports = nextConfig