<?php
/**
 * Cognika — sign-in.
 *
 * Self-posting form: no JavaScript required, and a failed attempt re-renders
 * with a generic message so the page never reveals whether a username exists.
 */
declare(strict_types=1);

require __DIR__ . '/inc/auth.php';

cognika_send_security_headers();

if (!cognika_session_start()) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Session storage is unavailable.\n");
}

$config = cognika_config();

// Already signed in? Skip the form.
if (cognika_is_logged_in()) {
    cognika_redirect((string) $config['after_login']);
}

$error    = '';
$notice   = '';
$username = '';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    // Keep the submitted username raw in every branch so the field can be
    // repopulated. cognika_e() escapes it once at render time.
    $username = (string) ($_POST['username'] ?? '');

    if (!cognika_csrf_valid($_POST['csrf'] ?? null)) {
        // Token expired (e.g. the page sat open too long) — re-render safely.
        $error = 'Your session expired before the form was submitted. Please try again.';
        cognika_auth_log('csrf_rejected');
    } else {
        $password = (string) ($_POST['password'] ?? '');
        $attempt  = cognika_attempt_login($username, $password);

        if ($attempt['ok']) {
            cognika_redirect((string) $config['after_login']);
        }

        // Escaping happens once, at render time, to avoid double-encoding.
        $error = $attempt['message'];
    }
}

// ?timeout=1 is set by dashboard.php when a session expires.
if (($_GET['timeout'] ?? '') === '1') {
    $notice = 'Your session ended. Please sign in again.';
}

$csrf = cognika_csrf_token();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#03050a">
  <meta name="robots" content="noindex, nofollow">
  <title>COGNIKA — Sign In</title>
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="assets/css/login.css?v=1">
</head>
<body>
  <div class="backdrop" aria-hidden="true">
    <picture>
      <source srcset="assets/img/back_ground.webp" type="image/webp">
      <img src="assets/img/back_ground.webp" alt="" width="1200" height="675" decoding="async">
    </picture>
  </div>

  <header class="auth-topbar">
    <a class="brand" href="/" aria-label="Cognika home">
      <span class="brand-name">COGNIKA<span class="brand-period">.</span></span>
      <span class="brand-tagline">INTELLIGENCE CREATES TOMORROW</span>
    </a>
    <div class="auth-topbar-meta" aria-label="Secure area">
      <span>SECURE AREA</span><i></i><span>ENCRYPTED</span>
    </div>
  </header>

  <main class="auth-main">
    <section class="auth-panel" aria-labelledby="authTitle">
      <p class="auth-topline">
        <span class="status-dot" aria-hidden="true"></span>
        <span>AUTHENTICATION</span>
        <span class="auth-index">01 / 01</span>
      </p>

      <span class="auth-mark" aria-hidden="true">
        <img class="panel-logo" src="assets/img/favicon.svg" alt="" width="40" height="40">
      </span>

      <h1 id="authTitle">Sign in</h1>
      <p class="auth-lead">Access is limited to authorised Cognika accounts.</p>

      <?php if ($error !== ''): ?>
        <p class="auth-message" role="alert"><?= cognika_e($error) ?></p>
      <?php elseif ($notice !== ''): ?>
        <p class="auth-message is-notice"><?= cognika_e($notice) ?></p>
      <?php endif; ?>

      <form class="auth-form" method="post" action="login.php" autocomplete="on" novalidate>
        <input type="hidden" name="csrf" value="<?= cognika_e($csrf) ?>">

        <div class="field">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value="<?= cognika_e($username) ?>"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            required
            autofocus>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required>
        </div>

        <button class="auth-submit" type="submit">
          ENTER <span aria-hidden="true">→</span>
        </button>
      </form>

      <div class="auth-foot">
        <span>SESSION SECURED</span>
        <a href="/">← Back to site</a>
      </div>
    </section>
  </main>

  <footer class="auth-footer">
    <span><span class="footer-line"></span>BUILT FOR A SMARTER FUTURE</span>
    <span>SYSTEMS THINKING, ENGINEERED</span>
  </footer>
</body>
</html>
