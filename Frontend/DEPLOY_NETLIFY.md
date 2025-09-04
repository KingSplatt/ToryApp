# ToryApp Frontend - Deploy Instructions for Netlify

## Prerequisites
1. Create account on [Netlify](https://netlify.com)
2. Backend already deployed on Render: https://toryappwebservice.onrender.com

## Build Configuration

### Netlify Build Settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 or higher

### Environment Variables:
Set in Netlify dashboard under Site settings > Environment variables:
```
VITE_API_BASE_URL=https://toryappwebservice.onrender.com
VITE_APP_NAME=ToryApp
VITE_DEFAULT_LANG=en
VITE_DEFAULT_THEME=light
```

## Deployment Steps:

### Option 1: Git Integration (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build settings as mentioned above
3. Deploy automatically on push to main branch

### Option 2: Manual Deploy
1. Run `npm run build` locally
2. Upload the `dist` folder to Netlify

## Important Files:
- `_redirects`: Handles SPA routing (already created)
- `netlify.toml`: Build configuration with environment variables (already configured)
- `src/config/config.ts`: Environment-aware API configuration (already configured)

## Custom Domain (Optional):
1. Add your custom domain in Netlify dashboard
2. Update CORS_ORIGINS in your backend environment variables on Render
3. Update OAuth redirect URIs in Google and Facebook consoles

## Testing:
After deployment, test:
1. Frontend loads correctly
2. API calls work (check browser network tab)
3. Authentication flows work
4. All features function properly

## Backend CORS Update Required:
Don't forget to update your backend's CORS_ORIGINS environment variable on Render to include your Netlify URL once deployed.
