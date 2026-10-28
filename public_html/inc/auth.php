<?php
/**
 * Cognika — session-based authentication.
 *
 * Design notes:
 *  - Credentials live outside the webroot and are verified with password_verify()
 *    against password_hash() output (Argon2id preferred, bcrypt accepted).
 *  - Unknown usernames are still checked against a dummy hash so response time
 *    does not reveal whether an account exists.
 *  - Failed attempts are throttled per (ip, username) pair, stored in a file
 *    inside the private session directory — no database required.
 *  - Every POST that changes state carries a CSRF token.
 */
declare(strict_types=1);

const COGNIKA_DUMMY_HASH = '$argon2id$v=19$m=65536,t=4,p=1$ZHVtbXlkdW1teWR1bW15$dummyhashdummyhashdummyhashdummy';

/** Load config, failing closed with a generic message. */
function cognika_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    // Preferred: private location outside the webroot.
    $candidates = [
        dirname(__DIR__, 2) . '/cognika-config/config.php', // ~/cognika-config/config.php
        dirname(__DIR__) . '/inc/config.php',              // fallback (blocked via .htaccess)
    ];

    foreach ($candidates as $path) {
        if (is_readable($path)) {
            $loaded = require $path;
            if (is_array($loaded) && isset($loaded['users'])) {
                $config = $loaded;
                return $config;
            }
        }
    }

    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit("Authentication is not configured.\n");
}

/** Emit security headers common to every page. */
function cognika_send_security_headers(bool $noStore = true): void
{
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header('X-Frame-Options: DENY');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    if ($noStore) {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
    }
}

/** Redirect helper that never returns. */
function cognika_redirect(string $path): never
{
    header('Location: ' . $path, true, 303);
    exit;
}

/** True when the request arrived over HTTPS (directly or via proxy). */
function cognika_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    return isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
        && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
}

/** Best-effort client IP. LiteSpeed/CloudLinux sets REMOTE_ADDR. */
function cognika_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

/**
 * Start the session with hardened cookie settings and a private save path.
 * Returns false when the session could not be started safely.
 */
function cognika_session_start(): bool
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return true;
    }

    $config = cognika_config();
    $path   = (string) $config['session_path'];

    if (!is_dir($path)) {
        @mkdir($path, 0700, true);
    }
    if (!is_dir($path) || !is_writable($path)) {
        return false;
    }
    @chmod($path, 0700);

    session_save_path($path);
    session_name((string) $config['session_name']);

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => cognika_is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');

    return session_start();
}

/** CSRF token for the current session, created on demand. */
function cognika_csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return (string) $_SESSION['csrf'];
}

/** Constant-time CSRF check. */
function cognika_csrf_valid(mixed $token): bool
{
    return is_string($token)
        && !empty($_SESSION['csrf'])
        && hash_equals((string) $_SESSION['csrf'], $token);
}

/** Escape for HTML output. */
function cognika_e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Is a session currently authenticated? Enforces idle + absolute timeouts. */
function cognika_is_logged_in(): bool
{
    if (empty($_SESSION['auth']) || $_SESSION['auth'] !== true) {
        return false;
    }

    $config = cognika_config();
    $now    = time();
    $last   = (int) ($_SESSION['last_seen'] ?? 0);
    $start  = (int) ($_SESSION['started_at'] ?? 0);

    if (($now - $last) > (int) $config['idle_timeout']
        || ($now - $start) > (int) $config['absolute_timeout']) {
        cognika_logout();
        return false;
    }

    $_SESSION['last_seen'] = $now;
    return true;
}

/** Require authentication, redirecting to the login page otherwise. */
function cognika_require_login(string $loginUrl = 'login.php'): void
{
    if (!cognika_is_logged_in()) {
        cognika_redirect($loginUrl);
    }
}

/** Destroy the session completely. */
function cognika_logout(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires'  => time() - 42000,
            'path'     => $params['path'],
            'domain'   => $params['domain'],
            'secure'   => (bool) $params['secure'],
            'httponly' => (bool) $params['httponly'],
            'samesite' => 'Lax',
        ]);
    }

    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}
/** Path of the throttle ledger inside the private session directory. */
function cognika_throttle_file(string $username): string
{
    $config = cognika_config();
    $key    = strtolower(trim($username)) . '|' . cognika_client_ip();
    return rtrim((string) $config['session_path'], '/') . '/throttle-' . hash('sha256', $key);
}

/** Seconds until this (ip, username) pair may try again. 0 = allowed. */
function cognika_throttle_retry_after(string $username): int
{
    $file = cognika_throttle_file($username);
    if (!is_readable($file)) {
        return 0;
    }

    $data = json_decode((string) @file_get_contents($file), true);
    if (!is_array($data)) {
        return 0;
    }

    $lock = (int) ($data['locked_until'] ?? 0);
    $now  = time();

    return $lock > $now ? $lock - $now : 0;
}

/** Record a failed attempt and lock the pair out once the threshold is hit. */
function cognika_throttle_fail(string $username): void
{
    $config = cognika_config();
    $file   = cognika_throttle_file($username);
    $now    = time();

    $data = ['count' => 0, 'first' => $now, 'locked_until' => 0];

    if (is_readable($file)) {
        $decoded = json_decode((string) @file_get_contents($file), true);
        if (is_array($decoded)) {
            $data['count']        = (int) ($decoded['count'] ?? 0);
            $data['first']        = (int) ($decoded['first'] ?? $now);
            $data['locked_until'] = (int) ($decoded['locked_until'] ?? 0);
        }
    }

    if (($now - (int) $data['first']) > (int) $config['attempt_window']) {
        $data['count'] = 0;
        $data['first'] = $now;
    }

    $data['count']++;

    if ($data['count'] >= (int) $config['max_attempts']) {
        $data['locked_until'] = $now + (int) $config['lockout_time'];
        $data['count']        = 0;
        $data['first']        = $now;
    }

    @file_put_contents($file, json_encode($data), LOCK_EX);
    @chmod($file, 0600);
}

/** Clear the throttle ledger after a successful login. */
function cognika_throttle_clear(string $username): void
{
    $file = cognika_throttle_file($username);
    if (is_file($file)) {
        @unlink($file);
    }
}

/** Append an auth event to the private log (never inside the webroot). */
function cognika_auth_log(string $event, array $extra = []): void
{
    $config = cognika_config();
    $line = json_encode([
        'ts'    => gmdate('c'),
        'event' => $event,
        'ip'    => cognika_client_ip(),
        'ua'    => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 160),
    ] + $extra, JSON_UNESCAPED_SLASHES);

    @file_put_contents((string) $config['log_file'], $line . "\n", FILE_APPEND | LOCK_EX);
    @chmod((string) $config['log_file'], 0600);
}



/**
 * Attempt a login.
 *
 * @return array{ok: bool, message: string, retry_after?: int}
 */
function cognika_attempt_login(string $username, string $password): array
{
    $config   = cognika_config();
    $username = trim($username);

    if ($username === '' || $password === '') {
        return ['ok' => false, 'message' => 'Enter both your username and password.'];
    }

    $retry = cognika_throttle_retry_after($username);
    if ($retry > 0) {
        $minutes = (int) ceil($retry / 60);
        return [
            'ok'          => false,
            'message'     => sprintf(
                'Too many failed attempts. Try again in %d minute%s.',
                $minutes,
                $minutes === 1 ? '' : 's'
            ),
            'retry_after' => $retry,
        ];
    }

    $users = $config['users'];
    $known = isset($users[$username]) && is_array($users[$username]);

    // Always run password_verify so unknown users cost the same time.
    $hash  = $known ? (string) ($users[$username]['hash'] ?? '') : COGNIKA_DUMMY_HASH;
    $valid = password_verify($password, $hash);

    if (!$known || !$valid) {
        cognika_throttle_fail($username);
        cognika_auth_log('login_failed', ['username' => $username, 'known' => $known]);
        return ['ok' => false, 'message' => 'Invalid username or password.'];
    }

    if (password_needs_rehash($hash, PASSWORD_ARGON2ID)) {
        cognika_auth_log('rehash_needed', ['username' => $username]);
    }

    // Prevent session fixation.
    session_regenerate_id(true);

    $_SESSION['auth']       = true;
    $_SESSION['username']   = $username;
    $_SESSION['display']    = (string) ($users[$username]['name'] ?? $username);
    $_SESSION['started_at'] = time();
    $_SESSION['last_seen']  = time();
    $_SESSION['csrf']       = bin2hex(random_bytes(32));

    cognika_throttle_clear($username);
    cognika_auth_log('login_ok', ['username' => $username]);

    return ['ok' => true, 'message' => 'Signed in.'];
}
