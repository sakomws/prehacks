import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          borderRadius: '40px',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 25C41.7157 25 35 31.7157 35 40C35 51.25 50 65 50 65C50 65 65 51.25 65 40C65 31.7157 58.2843 25 50 25Z"
            fill="white"
            opacity="0.95"
          />
          <circle cx="50" cy="40" r="6" fill="#3B82F6" />
          <path
            d="M30 70 Q40 65 50 70 T70 70"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
