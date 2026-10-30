<?php
/**
 * Cognika — authentication configuration (TEMPLATE).
 *
 * Copy this file to ~/cognika-config/config.php (OUTSIDE public_html) and
 * fill in real values. Never commit the filled-in file, never place it in
 * the webroot: anything under public_html is publicly fetchable by URL.
 *
 * Generate a password hash on the server with:
 *   php -r 'echo password_hash("YOUR-PASSWORD", PASSWORD_ARGON2ID), PHP_EOL;'
 */
declare(strict_types=1);

return [
    /*
     * Users, keyed by login name.
     * Each entry: password_hash from password_hash() plus an optional display name.
     * Argon2id is preferred; bcrypt ("2y") also works and is accepted as-is.
     */
    'users' => [
        'admin' => [
            'hash'  => '$argon2id$v=19$m=65536,t=4,p=1$REPLACE_WITH_REAL_HASH',
            'name'  => 'Cognika Admin',
        ],
    ],

    /*
     * Absolute path for PHP session files. Must be writable by the web user
     * and must NOT be the shared /tmp on this host (CloudLinux shares /tmp
     * between accounts, which makes session filenames guessable by neighbours).
     */
    'session_path' => __DIR__ . '/../tmp/sessions',

    /* Session cookie name. Avoid the default PHPSESSID. */
    'session_name' => 'cognika_sid',

    /* Idle timeout in seconds (default: 2 hours). Absolute lifetime is separate. */
    'idle_timeout' => 7200,

    /* Absolute session lifetime in seconds, regardless of activity (default: 12h). */
    'absolute_timeout' => 43200,

    /* Failed-login throttling. */
    'max_attempts'   => 5,      // attempts allowed per window
    'attempt_window' => 900,    // window length in seconds (15 min)
    'lockout_time'   => 900,    // how long a locked identifier stays blocked

    /* Where to send the browser after a successful login. */
    'after_login'  => 'dashboard.php',

    /* Error log for auth events. Keep it outside the webroot. */
    'log_file' => __DIR__ . '/../tmp/auth.log',

    /*
     * Set to true only while developing over plain HTTP. In production keep
     * false: HTTPS is enforced and cookies are marked Secure.
     */
    'allow_insecure_http' => false,
];
