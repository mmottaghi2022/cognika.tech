<?php
/**
 * Cognika — protected dashboard.
 *
 * Everything below the require is only reachable with a valid session.
 * Logout is a POST with a CSRF token so a link prefetch or image tag on
 * another site cannot sign the user out.
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

// Handle logout before the auth gate, so an expired session can still clear.
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && isset($_POST['logout'])) {
    if (cognika_csrf_valid($_POST['csrf'] ?? null)) {
        cognika_auth_log('logout', ['username' => (string) ($_SESSION['username'] ?? '')]);
    }
    cognika_logout();
    cognika_redirect('login.php');
}

// Gate. Redirects to login.php when there is no valid session.
if (!cognika_is_logged_in()) {
    cognika_logout();
    cognika_redirect('login.php?timeout=1');
}

$display  = (string) ($_SESSION['display'] ?? 'Authorised user');
$username = (string) ($_SESSION['username'] ?? '');
$started  = (int) ($_SESSION['started_at'] ?? time());
$csrf     = cognika_csrf_token();

$idleTimeout = (int) $config['idle_timeout'];
$expiresAt   = min($started + (int) $config['absolute_timeout'], time() + $idleTimeout);
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#03050a">
  <meta name="robots" content="noindex, nofollow">
  <title>COGNIKA — Console</title>
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
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
    <div class="auth-topbar-meta" aria-label="Session state">
      <span>AUTHENTICATED</span><i></i><span><?= cognika_e(strtoupper($username)) ?></span>
    </div>
  </header>

  <main class="auth-main">
    <section class="auth-panel" aria-labelledby="authTitle">
      <p class="auth-topline">
        <span class="status-dot" aria-hidden="true"></span>
        <span>CONSOLE</span>
        <span class="auth-index">01 / 01</span>
      </p>

      <span class="auth-mark" aria-hidden="true">
        <img class="panel-logo" src="assets/img/favicon.svg" alt="" width="40" height="40">
      </span>

      <h1 id="authTitle">Welcome</h1>
      <p class="auth-lead">Signed in as <strong><?= cognika_e($display) ?></strong>.</p>

      <p class="auth-message is-notice">
        Session active since <?= cognika_e(gmdate('H:i', $started)) ?> UTC.
        This page is the authenticated area — build the real content here.
      </p>

      <form class="auth-form" method="post" action="dashboard.php">
        <input type="hidden" name="csrf" value="<?= cognika_e($csrf) ?>">
        <input type="hidden" name="logout" value="1">
        <button class="auth-submit" type="submit">
          SIGN OUT <span aria-hidden="true">→</span>
        </button>
      </form>

      <div class="auth-foot">
        <span>EXPIRES <?= cognika_e(gmdate('H:i', $expiresAt)) ?> UTC</span>
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
