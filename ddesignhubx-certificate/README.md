# DDesignHubX Academy — Certificate Verification

A deployable certificate issuing and QR verification web app with premium responsive UI, secure admin login, Supabase database, and Vercel serverless endpoints.

## Features
- Public landing page with certificate ID search
- Public certificate verification page, including revoked status
- Password-protected admin login using Supabase Auth
- Admin-only certificate issuing, listing, QR PNG downloads, and revocation
- Static QR points to a permanent `/verify/<random-uuid>` link
- Database uses Row Level Security with **no client read/write policies**
- Service-role key is used **only inside Vercel server functions**, never in browser code

## 1. Set up Supabase
1. Create a project at https://supabase.com.
2. Open **SQL Editor** and execute `supabase/schema.sql`.
3. Open **Authentication → Users**, add your own admin email as a user, and set a strong password. Confirm the email. Do not give students admin accounts.
4. Find your **Project URL** and **anon / publishable key** in Supabase project settings. Find the **service_role / secret key** there too. Keep the service-role key private.

## 2. Configure environment variables
Copy `.env.example` to `.env.local` for local frontend development and fill it in. **Do not commit `.env.local`.**

For a Vercel deployment, add **all five** values in Project → Settings → Environment Variables:

- `VITE_SUPABASE_URL`: your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: your Supabase anon key
- `SUPABASE_URL`: your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: secret service-role key (server-only)
- `ADMIN_EMAIL`: the exact confirmed email of the admin user you created

After changing environment variables, redeploy.

## 3. Push to GitHub
1. Create a **new GitHub repository** (do not overwrite your portfolio repository).
2. Upload the project files, keeping `api/`, `src/`, `supabase/` and root files in their original folders.
3. Never upload `.env` or `.env.local`.

## 4. Deploy to Vercel
1. Import the GitHub repository in https://vercel.com.
2. Framework preset: **Vite**. Build command: `npm run build`; output directory: `dist`.
3. Set all five environment variables listed above.
4. Deploy. Visit `/admin` to log in.

## 5. Issue and verify a certificate
1. Log in at `https://YOUR-VERCEL-DOMAIN/admin`.
2. Fill in student details and click **Issue & generate QR**.
3. Download the QR PNG and place it in your certificate design in Figma.
4. Send the certificate to the student.
5. Scanning the QR opens `https://YOUR-VERCEL-DOMAIN/verify/<random-uuid>` and verifies the database record.
6. Alternatively, users can search using the displayed certificate ID on the home page.
7. If you revoke a certificate in the dashboard, its verification page shows **Certificate revoked**.

**Use a permanent domain before issuing real certificates.** QR images encode the exact URL at the time of generation. If you change domains later, old QR codes won't automatically update.

## Local development
Run `npm install` and `npm run dev` for the frontend. **Note:** Vite alone does not execute `/api/*` Vercel serverless functions. For a fully working local API, install Vercel CLI and use `vercel dev`, or deploy a preview to Vercel.

## Security and production notes
- This is an initial production-oriented starter, not an independently audited security system.
- Enable multi-factor authentication for the admin account if your Supabase Auth configuration supports it.
- Enable rate limiting/WAF for public `/api/find` and `/api/verify` endpoints in your hosting platform to reduce automated enumeration.
- Add monitoring, backups, and a privacy policy before broad public use.
- The public ID search deliberately reveals only a random verification token for an exact valid ID; it does not expose all certificates.
- No student account can update records; the admin email is allowlisted on every admin API request.
- PDF tamper detection is **not** implemented. The official database verification page is the source of truth.
- A private academy verification system is not equivalent to government accreditation.
