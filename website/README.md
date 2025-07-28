# Company Dashboard

A Next.js application for displaying company analytics and insights with a modern, responsive interface.

## Features

- **Multi-company Dashboard**: Navigate between different company dashboards
- **Dynamic Routes**: Each company has its own dedicated page at `/c/[company]`
- **S3/CDN Integration**: Display PNG files from your S3 bucket via CDN
- **Modern UI**: Dark theme with orange accent colors
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

## Color Scheme

- **Background**: Black (`#000000`)
- **Text**: White (`#ffffff`)
- **Primary/Buttons/Headers**: Orange (`rgb(249, 115, 22)`)
- **Card Backgrounds**: Dark blue-gray (`rgb(3, 7, 18, 0.9)`)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customizing for Your Companies

### 1. Update Company List

Edit `src/app/page.tsx` and modify the `companies` array:

```typescript
const companies = [
  { id: "h100", name: "H100", description: "H100 Company Dashboard" },
  { id: "your-company", name: "Your Company", description: "Your Company Description" },
  // Add more companies here
];
```

### 2. Configure S3/CDN Integration

Edit the `fetchCompanyImages` function in `src/app/c/[company]/page.tsx`:

```typescript
const fetchCompanyImages = async (companyId: string): Promise<string[]> => {
  // Replace with your actual S3/CDN endpoint
  const response = await fetch(`https://your-cdn-domain.com/api/images/${companyId}`);
  const data = await response.json();
  return data.images; // Array of image URLs
};
```

### 3. Environment Variables

Create a `.env.local` file for your API endpoints:

```env
NEXT_PUBLIC_CDN_BASE_URL=https://your-cdn-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

## Project Structure

```
src/
├── app/
│   ├── c/
│   │   └── [company]/
│   │       └── page.tsx      # Dynamic company dashboard
│   ├── globals.css           # Global styles and color scheme
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page with company grid
├── components/
│   └── CompanyCard.tsx      # Reusable company card component
└── ...
```

## Available Routes

- `/` - Home page with company grid
- `/c/h100` - H100 company dashboard
- `/c/[company]` - Dynamic company dashboard for any company ID

## Deployment

This app can be deployed on any platform that supports Next.js:

- **Vercel** (recommended): `vercel --prod`
- **Netlify**: Connect your Git repository
- **AWS Amplify**: Connect your Git repository
- **Docker**: Use the included Dockerfile

## Technologies Used

- **Next.js 15.4.4** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **React 19** - Latest React features
- **ESLint** - Code linting and formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
