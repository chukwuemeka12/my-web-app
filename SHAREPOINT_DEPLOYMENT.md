# Deploying to SharePoint

This guide will help you deploy the Customer Health Index Dashboard to SharePoint.

## Prerequisites

1. SharePoint site with appropriate permissions to add and configure web parts
2. Access to SharePoint's App Catalog (contact your SharePoint administrator if needed)

## Deployment Steps

### 1. Prepare the Build

The React application has been built and optimized for SharePoint deployment. The build files are located in:
```
client/dist/
```

### 2. Upload to SharePoint Document Library

1. In your SharePoint site, create a new document library (if one doesn't exist) to host the application files
   - Navigate to your SharePoint site
   - Click on "New" > "Document Library"
   - Name it something like "CHI-Dashboard"

2. Upload the contents of the `client/dist` folder to the document library
   - Make sure to maintain the folder structure
   - The key files to upload are:
     - `index.html`
     - All files in the `assets` folder
     - Any other generated files

### 3. Configure SharePoint Page

1. Create a new SharePoint page or use an existing one
2. Add a "Script Editor" web part to the page
   - If you don't see the Script Editor web part, you may need to enable it in the site settings

3. In the Script Editor web part, add the following HTML:
```html
<div id="root"></div>
<script type="text/javascript">
  // Update this path to match your document library location
  const basePath = '/sites/YourSite/CHI-Dashboard';
  
  // Load the main script
  const script = document.createElement('script');
  script.src = `${basePath}/assets/index.js`;
  document.body.appendChild(script);

  // Load the CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${basePath}/assets/index.css`;
  document.head.appendChild(link);
</script>
```

4. Update the `basePath` in the script to match your SharePoint site and document library path

### 4. Configure Backend Integration

Since the backend needs to be accessible from SharePoint, you have two options:

1. **Host the Backend Server Separately**
   - Deploy the Node.js server to a cloud service (e.g., Azure, Heroku)
   - Update the API endpoint in the frontend code to point to the hosted backend
   - Rebuild the frontend with the updated endpoint

2. **Use SharePoint Lists**
   - Convert the CSV data to SharePoint lists
   - Update the frontend to use SharePoint's REST API
   - This requires additional development to integrate with SharePoint's API

### 5. Testing

1. Open the SharePoint page in your browser
2. Verify that:
   - The dashboard loads correctly
   - All components are displayed properly
   - Data is being fetched and displayed
   - Charts and tables are interactive
   - File upload functionality works (if using hosted backend)

### Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify all paths in the Script Editor web part are correct
3. Ensure all required files were uploaded to the document library
4. Check CORS settings if using a hosted backend
5. Verify SharePoint permissions are correctly configured

## Security Considerations

1. Ensure sensitive data is properly secured
2. Use HTTPS for all external API endpoints
3. Implement proper authentication if required
4. Follow SharePoint's security best practices

## Support

For additional support:
1. Contact your SharePoint administrator
2. Review SharePoint documentation
3. Check the application's documentation and README files
