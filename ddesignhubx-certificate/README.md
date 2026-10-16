# DDesignHubX Academy — Certificate Verification

A responsive certificate issuing and QR verification app with username/password admin login, Supabase database storage, and Vercel serverless endpoints.

## Features
- Public landing page with certificate ID search
- Public certificate verification page, including revoked status
- Admin login with a server-checked username and password
- Signed, HttpOnly admin session cookie (8-hour expiry)
- Admin-only certificate issuing, listing, QR PNG downloads, and revocation
- Static QR points to a permanent `/verify/<random-uuid>` link
- Supabase service-role key is used only inside server functions, never in browser code

## 1. Set up Supabase
1. Create a project at https://supabase.com.
2. Open **SQL Editor** and execute `supabase/schema.sql`.
3. Find your **Project URL** and **service_role / secret key** in Supabase project settings. Keep the service-role key private. The browser no longer needs a Supabase anon key for admin authentication.

## 2. Configure Vercel environment variables
In Vercel, open **Project → Settings → Environment Variables** and add these values for the environment you deploy:

- `SUPABASE_URL`: your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: your Supabase service-role/secret key (**server-only; never expose it in frontend code**)
- `ADMIN_USERNAME`: the username you want to use for the admin login
- `ADMIN_PASSWORD`: a long, unique password for the admin login
- `ADMIN_SESSION_SECRET`: a random secret of at least 32 characters, used to sign admin sessions

Generate a session secret locally with Node.js using `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Do not share or commit this value. Do not use your Supabase service-role key as the session secret.

After adding or changing environment variables, redeploy the project. The old `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `ADMIN_EMAIL` values are not required by the new browser login flow.

## 3. Deploy to Vercel
1. Import this GitHub repository into https://vercel.com.
2. Set the framework preset to **Vite**, build command to `npm run build`, and output directory to `dist`.
3. Add all five environment variables above.
4. Deploy, then visit `/admin` and sign in with your configured username and password.

## 4. Issue and verify a certificate
1. Log in at `https://YOUR-VERCEL-DOMAIN/admin`.
2. Fill in student details and click **Issue & generate QR**.
3. Download the QR PNG and place it in your certificate design.
4. Send the certificate to the student.
5. Scanning the QR opens `https://YOUR-VERCEL-DOMAIN/verify/<random-uuid>` and verifies the database record.
6. Alternatively, users can search using the displayed certificate ID on the home page.
7. If you revoke a certificate in the dashboard, its verification page shows **Certificate revoked**.

**Use a permanent domain before issuing real certificates.** QR images encode the exact URL at the time of generation. If you change domains later, old QR codes will not automatically update.

## Local development
Run `npm install` and `npm run dev` for the frontend. Vite alone does not execute `/api/*` Vercel serverless functions. For a fully working local API, use Vercel CLI with `vercel dev`, or deploy a preview to Vercel. The session cookie is marked `Secure`, so test the full login flow on HTTPS.

## Security notes
- This is a practical starter implementation, not an independently audited security system.
- Use a strong unique admin password and keep all secrets in Vercel environment variables.
- Enable rate limiting/WAF for login and public verification endpoints to reduce automated attempts and enumeration.
- The admin session expires after 8 hours. Signing out clears the browser cookie.
- The public ID search is designed to reveal only the matching verification result, not a full certificate list.
- PDF tamper detection is not implemented. The official database verification page is the source of truth.
- A private academy verification system is not equivalent to government accreditation.
