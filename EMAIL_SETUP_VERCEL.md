# PepoShots — email setup in Vercel

The application is already wired for real email delivery through Gmail SMTP.

## Required Vercel environment variables

Add exactly these three variables:

- `EMAIL_FROM` = `camilahdezb007@gmail.com`
- `EMAIL_TO` = `peposchots5@gmail.com`
- `GMAIL_APP_PASSWORD` = the 16-character Google App Password generated for the sender account

Recommended scopes in Vercel: Production + Preview + Development while testing. At minimum, Production is required for the live site.

Do not use the normal Gmail password, recovery codes, passkeys, or security keys.

## What happens

### Booking form
The website sends from `EMAIL_FROM` to `EMAIL_TO`.
The customer's email is set as `Reply-To`, so pressing Reply in Gmail responds directly to the customer.

### Review form
Review submissions use the same sender and recipient. Optional uploaded event photos are attached to the email.

## Expected production behavior

If any required email credential is missing in production, the API returns an error instead of pretending the message was sent.

## Final test after deployment

1. Open the production URL from a phone.
2. Submit a booking using an email address you can access.
3. Confirm the message arrives in `peposchots5@gmail.com`.
4. Press Reply and verify Gmail addresses the reply to the test customer's email.
5. Submit one review without a photo.
6. Submit one review with a small photo and verify the attachment arrives.
