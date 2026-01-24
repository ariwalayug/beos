# Deployment Guide: Blood Emergency Platform

This guide will help you put your "Blood Emergency Platform" on the internet so anyone can use it.
We will deploy the **Backend** (Server) to **Render** and the **Frontend** (Website) to **Vercel**.

---

## ✅ Prerequisites

1. **GitHub Account**: You need an account at [github.com](https://github.com/).
2. **Code on GitHub**: Your project code (`beos` folder) must be uploaded to a GitHub repository.
   - If you haven't done this, drag and drop your project folders into a new GitHub repository or use Git commands to push it.

---

## 🚀 Step 1: Deploy Backend (Server)

We use **Render** to host the Node.js server.

1. **Create Account**: Go to [render.com](https://render.com/) and sign up with GitHub.
2. **New Web Service**:
   - Click **"New +"** button -> Select **"Web Service"**.
   - Select "Build and deploy from a Git repository".
   - Connect your GitHub account and select your `beos` repository.
3. **Configure Service**:
   - **Name**: `beos-backend` (or similar)
   - **Region**: Choose one close to you (e.g., Singapore, Frankfurt)
   - **Branch**: `main` (or master)
   - **Root Directory**: `backend` (Important! This tells Render where the server code is)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Select "Free" (if available) or "Starter".
4. **Environment Variables**:
   - Scroll down to "Environment Variables".
   - Click "Add Environment Variable".
   - Key: `NODE_ENV`, Value: `production`
   - *(We will add the frontend URL here later)*
5. **Deploy**:
   - Click **"Create Web Service"**.
   - Wait for the deployment to finish. It will take a few minutes.
   - Once done, look for the **URL** at the top left (e.g., `https://beos-backend.onrender.com`).
   - **Copy this URL**. This is your **Backend URL**.

> **Note on Database**: Since we are using SQLite (a file-based database), your data (users, requests) might reset if the server restarts or redeploys. This is normal for this setup.

---

## 🌐 Step 2: Deploy Frontend (Website)

We use **Vercel** to host the React frontend.

1. **Create Account**: Go to [vercel.com](https://vercel.com/) and sign up with GitHub.
2. **New Project**:
   - Click **"Add New..."** -> **"Project"**.
   - Import your `beos` repository.
3. **Configure Project**:
   - **Framework Preset**: Vite (should be auto-detected).
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
4. **Environment Variables**:
   - Click **"Environment Variables"**.
   - Add the following (use the Backend URL you copied in Step 1):
     - Key: `VITE_API_URL`
     - Value: `https://beos-backend.onrender.com` (Your actual backend URL, **no trailing slash**)
     - Key: `VITE_SOCKET_URL`
     - Value: `https://beos-backend.onrender.com` (Same URL)
5. **Deploy**:
   - Click **"Deploy"**.
   - Wait a moment. You will see fireworks when it's done! 🎆
   - Click the **Domain** link (e.g., `https://beos-frontend.vercel.app`).
   - **Copy this URL**. This is your **Frontend URL**.

---

## 🔗 Step 3: Connect Frontend to Backend

Now we need to tell the Backend to allow connections from your new Frontend.

1. Go back to your **Render Dashboard** (Backend).
2. Go to **"Environment"** settings.
3. Add a new variable:
   - Key: `CLIENT_URL`
   - Value: `https://beos-frontend.vercel.app` (Your actual Frontend URL from Step 2)
4. **Save Changes**. Render will automatically restart your server to apply this change.

---

## 🧪 Step 4: Test Your Deployment

1. Open your **Frontend URL** in a browser.
2. **Register**: Creates a new user (this effectively tests the Database).
3. **Login**: Logs you in (tests Auth & Token).
4. **Create Request**: Try creating a blood request (tests API).
5. **Check Real-time**: Open the site in a second window (incognito) or on your phone.
   - Login as a different user (or donor).
   - See if the new request appears instantly (tests Socket.IO).

**If you see a blank screen or errors:**
- Check the **Console** (F12 > Console) in your browser.
- Check the **Logs** in Render or Vercel dashboards to see what happened on the server.

---

## 🔄 How to Redeploy

If you make changes to your code:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fixed a bug"
   git push origin main
   ```
2. **Automatic**: Vercel and Render will see the new code and **automatically redeploy** your site.
3. You don't need to do anything else!

---

**Congratulations!** 🎉
Your Blood Emergency Platform is now live.

