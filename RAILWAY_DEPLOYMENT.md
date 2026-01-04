# Railway Deployment Guide for Next-Web

This guide will help you deploy the Next-Web application to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository with your Next-Web code
- Solana wallet for testing

## Step 1: Create a New Project on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `Next-Web` repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL instance and set the `DATABASE_URL` environment variable

## Step 3: Configure Environment Variables

In your Railway project settings, add the following environment variables:

### Required Variables

```bash
# Database (automatically set by Railway PostgreSQL)
DATABASE_URL=postgresql://... (automatically configured)

# NextAuth / JWT
NEXTAUTH_SECRET=your-production-secret-key-change-this
NEXTAUTH_URL=https://your-app.railway.app

# Solana RPC (optional, has defaults)
NEXT_PUBLIC_DEFAULT_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_DEVNET_RPC_ENDPOINT=https://api.devnet.solana.com

# Environment
NODE_ENV=production
```

### Generate a Secure Secret

To generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Or use an online generator like: https://generate-secret.vercel.app/32

## Step 4: Run Database Migrations

After the first deployment, you need to run database migrations:

1. Go to your Railway project
2. Click on your Next-Web service
3. Go to the "Settings" tab
4. Scroll down to "Deploy"
5. Add a "Build Command":

```bash
npm install && prisma migrate deploy && npm run build
```

Alternatively, you can run migrations from the Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run db:migrate
```

## Step 5: Deploy

Railway will automatically deploy your application when you push to your GitHub repository.

### Manual Deployment

You can also trigger a manual deployment:

1. In your Railway project
2. Click "Deploy" button

## Step 6: Access Your Application

Once deployed, Railway will provide you with a URL like:
`https://next-web-production.up.railway.app`

## Database Management

### View Database

Use Prisma Studio to view your database:

```bash
railway run npm run db:studio
```

### Push Schema Changes (Development)

If you're still in development and want to push schema changes without migrations:

```bash
railway run npm run db:push
```

### Create Migrations (Production)

For production, always use migrations:

```bash
# Create a migration
npx prisma migrate dev --name your_migration_name

# Commit and push to GitHub
git add .
git commit -m "Add database migration"
git push
```

## Troubleshooting

### Build Fails

1. Check Railway logs
2. Verify all environment variables are set
3. Ensure `DATABASE_URL` is accessible

### Database Connection Issues

1. Make sure PostgreSQL service is running
2. Check `DATABASE_URL` format
3. Verify Prisma schema is correct

### Application Crashes

1. Check logs in Railway dashboard
2. Verify `NEXTAUTH_SECRET` is set
3. Ensure Node.js version is compatible (18+)

## Railway Configuration Files

This project includes:

- `railway.json` - Railway deployment configuration
- `.env.example` - Example environment variables
- `prisma/schema.prisma` - Database schema

## Cost Estimation

Railway offers:
- **Free Tier**: $5 credit per month (suitable for testing)
- **Starter Plan**: $5/month + usage
- PostgreSQL: ~$0.01/hour (~$7.20/month)

## Support

For issues with:
- **Railway**: https://help.railway.app
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs

## Next Steps

After deployment:

1. Test Solana wallet authentication
2. Create a test workspace
3. Export/import workspace JSON
4. Configure custom domain (optional)
5. Set up monitoring and alerts

---

**Note**: Remember to keep your `NEXTAUTH_SECRET` and `DATABASE_URL` secure and never commit them to version control.

