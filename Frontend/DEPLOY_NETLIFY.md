# ToryApp Frontend - Deploy Instructions for Netlify

## Prerequisites
1. Create account on [Netlify](https://netlify.com)
2. Have your backend deployed on Render

## Build Configuration

### Netlify Build Settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 or higher

### Environment Variables:
Set in Netlify dashboard under Site settings > Environment variables:
```
VITE_API_URL=https://your-render-backend.onrender.com
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
- `vite.config.ts`: Build configuration (already created)
- `src/config/config.ts`: Environment-aware API configuration (already created)

## Custom Domain (Optional):
1. Add your custom domain in Netlify dashboard
2. Update CORS_ORIGINS in your backend environment variables
3. Update OAuth redirect URIs

## Testing:
After deployment, test:
1. Frontend loads correctly
2. API calls work (check browser network tab)
3. Authentication flows work
4. All features function properly
