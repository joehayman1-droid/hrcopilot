# hrcopilot

Expert-backed HR for small business.

## Deploy in 3 steps

### 1. Push to GitHub
Upload this entire folder to your GitHub repository.

### 2. Connect to Vercel
- Go to vercel.com
- Click "Add New Project"
- Import your GitHub repo
- Framework: Create React App
- Click Deploy — done in ~2 minutes

### 3. Connect your GoDaddy domain
- In Vercel: Project → Settings → Domains → add your domain
- In GoDaddy: DNS → Nameservers → enter Vercel's nameservers
- Wait 15–30 min to propagate

## Local development
```
npm install
npm start
```

## Notes
- The AI document generator and Ask Experts features call the Anthropic API
- Add your API key as an environment variable in Vercel: `REACT_APP_ANTHROPIC_KEY`
- See src/App.js to update the fetch headers with your key
