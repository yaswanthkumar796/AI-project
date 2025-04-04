# Travel Safety Assistant

A web application that provides travel safety advice and information for destinations worldwide.

## Features

- Get famous destinations for a selected location
- Create detailed travel plans
- Receive safety tips for specific destinations
- Emergency information and local transportation options

## Deployment on Render

### Option 1: Manual Deployment

1. Sign up for a [Render account](https://render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository or use "Deploy from existing repository"
4. Configure the service:
   - Name: travel-safety-assistant
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Create Web Service"

### Option 2: Using render.yaml (Blueprint)

1. Push your code to GitHub (including the render.yaml file)
2. Sign up for a [Render account](https://render.com/)
3. Go to the [Blueprint](https://render.com/docs/blueprint-spec) section
4. Connect to your GitHub repository
5. Render will automatically detect the render.yaml file and deploy your service

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000

## Environment Variables

- `PORT`: The port the server will run on (default: 3000)
- `NODE_ENV`: The environment (development/production) 