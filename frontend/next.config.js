/** @type {import('next').NextConfig} */
const nextConfig = {}

// module.exports = nextConfig

module.exports = {
	images: {
	  remotePatterns: [
		{
		  protocol: 'https',
		  hostname: 'avatars.githubusercontent.com',
		  port: '',
		  pathname: '/u/**',
		},
		{
		  protocol: 'https',
		  hostname: 'cdn.intra.42.fr',
		  port: '',
		  pathname: '/users/**',
		},
	  ],
	},
  }