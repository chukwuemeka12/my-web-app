# Deploying Your Customer Health Index Dashboard

This guide will help you deploy your application to the web using Vercel (frontend) and Heroku (backend).

## Frontend Deployment (Vercel)

1. First, create a Vercel account at https://vercel.com

2. Install the Vercel CLI:
```bash
npm install -g vercel
```

3. Navigate to the client directory:
```bash
cd client
```

4. Deploy to Vercel:
```bash
vercel
```

5. Follow the prompts to:
   - Log in to your Vercel account
   - Set up the project
   - Choose your team/account
   - Confirm the deployment

6. Once deployed, Vercel will give you a URL for your frontend (e.g., https://your-app.vercel.app)

## Backend Deployment (Heroku)

1. Create a Heroku account at https://heroku.com

2. Install the Heroku CLI:
   - Download from: https://devcenter.heroku.com/articles/heroku-cli

3. Log in to Heroku:
```bash
heroku login
```

4. Create a new Heroku app:
```bash
heroku create chi-dashboard-backend
```

5. Deploy to Heroku:
```bash
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

6. Once deployed, Heroku will give you a URL for your backend (e.g., https://chi-dashboard-backend.herokuapp.com)

## Connecting Frontend to Backend

1. In your Vercel dashboard:
   - Go to your project settings
   - Add an environment variable:
     - Name: `VITE_API_URL`
     - Value: Your Heroku backend URL (e.g., https://chi-dashboard-backend.herokuapp.com)

2. Redeploy your frontend:
```bash
cd client
vercel --prod
```

## Testing the Deployment

1. Open your Vercel URL in a browser
2. Test the following functionality:
   - Loading the dashboard
   - Uploading CSV files
   - Viewing member data
   - Checking all charts and tables

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify your environment variables are set correctly
3. Check Heroku logs:
```bash
heroku logs --tail
```
4. Check Vercel deployment logs in the Vercel dashboard

## Security Considerations

1. Set up proper CORS configuration in the backend
2. Implement authentication if needed
3. Secure sensitive data
4. Use HTTPS for all communications

## Maintenance

1. Monitor your Heroku and Vercel dashboards
2. Set up alerts for errors
3. Regularly update dependencies
4. Back up your data

## Support

If you need help:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Heroku documentation: https://devcenter.heroku.com
3. Review the application's README files
