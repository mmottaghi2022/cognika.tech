# Cognika — authentication setup

Session-based login for the Cognika site. Single-file, no database, no Composer
dependencies. Requires PHP 7.4+ (verified on the host's PHP 8.1.34).

## Files

| Path | Purpose |
|---|---|
| `login.php` | Sign-in form + POST handler. Self-posting, no JS required. |
| `dashboard.php` | Protected page. Redirects to `login.php` without a session. |
| `inc/auth.php` | Session, CSRF, throttling, and credential verification. |
| `inc/config.example.php` | Config template — **copy it outside the webroot**. |
| `inc/.htaccess` | Denies all HTTP access to `inc/`. |
| `assets/css/login.css` | Page styling, reusing the site's design tokens. |

## Setup (on the server, as `cognikat`)

1. **Create the private config directory** (outside `public_html`, so it can
   never be fetched by URL):

   ```bash
   mkdir -p ~/cognika-config ~/tmp/sessions
   chmod 700 ~/cognika-config ~/tmp/sessions
   cp ~/public_html/inc/config.example.php ~/cognika-config/config.php
   chmod 600 ~/cognika-config/config.php
   ```

2. **Generate a password hash** and paste it into `~/cognika-config/config.php`
   as the value of `'hash'`:

   ```bash
   php -r 'echo password_hash("YOUR-STRONG-PASSWORD", PASSWORD_ARGON2ID), PHP_EOL;'
   ```

   Adjust `session_path` and `log_file` in the config if you use different
   directories. Both must live **outside** `public_html`.

3. **Verify the include directory is blocked.** This must return **403**:

   ```bash
   curl -o /dev/null -w '%{http_code}\n' https://cognika.tech/inc/config.example.php
   ```

4. Visit `https://cognika.tech/login.php` and sign in.

## Security properties

- **Argon2id** password hashing via `password_hash()` / `password_verify()`
  (the host reports `password_algos: 2y,argon2i,argon2id`).
- **Dummy-hash comparison** for unknown usernames, so timing does not reveal
  which accounts exist.
- **Session fixation** prevented with `session_regenerate_id(true)` on login.
- **Private session storage** — `session_path` is set to a directory you own,
  *not* the host's shared `/tmp` (CloudLinux shares `/tmp` between accounts).
- **Cookies** are `HttpOnly`, `SameSite=Lax`, and `Secure` whenever HTTPS is
  detected.
- **CSRF** token on both the login form and logout.
- **Throttling**: 5 failed attempts per (IP, username) pair → 15-minute lockout.
- **Idle and absolute session timeouts** (2h / 12h by default).
- **Generic error text** and `noindex` on all auth pages.
- **Auth events logged** to a private file outside the webroot.

## Adding more users

Add entries to the `users` array in `config.php`; the key is the login name:

```php
'users' => [
    'admin'   => ['hash' => '...', 'name' => 'Cognika Admin'],
    'support' => ['hash' => '...', 'name' => 'Support Team'],
],
```

## Not included (deliberately)

- User registration — auth is admin-provisioned.
- Password reset by email (would need a mailer and token table).
- "Remember me" persistent logins (higher risk, needs a token store).

## Deploying to the host

The webroot is `/home/cognikat/public_html`. Upload these paths and keep
`config.php` in `~/cognika-config/`, never inside `public_html`:

```
login.php
dashboard.php
inc/auth.php
inc/config.example.php
inc/.htaccess
assets/css/login.css
```
