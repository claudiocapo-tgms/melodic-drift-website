<?php
// Contact form handler for contact.html. Receives the form via POST and emails it.
// Replies with JSON: {"success": true} or {"success": false, "message": "..."}.

// ---- Settings: change these two addresses before going live ----
const TO_EMAIL   = 'melodicdrift@tanzgemeinschaft.com';  // where enquiries are delivered
const FROM_EMAIL = 'melodicdrift@tanzgemeinschaft.com';  // sender address; use one on your own domain so mail is not marked as spam
const SITE_NAME  = 'Melodic Drift';
// -----------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(bool $success, string $message = ''): void {
    echo json_encode($success ? ['success' => true] : ['success' => false, 'message' => $message]);
    exit;
}

// One line only: removes line breaks so nobody can inject extra mail headers.
function one_line(string $value, int $max): string {
    $value = trim(preg_replace('/[\r\n\t]+/', ' ', $value));
    return mb_substr($value, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Method not allowed.');
}

if (TO_EMAIL === 'CHANGE-ME@example.com' || FROM_EMAIL === 'CHANGE-ME@example.com') {
    http_response_code(500);
    respond(false, 'The contact form is not set up yet.');
}

// Hidden "company" field: people never see it, spam bots fill it in. Pretend it worked.
if (!empty($_POST['company'])) {
    respond(true);
}

$name    = one_line((string)($_POST['name'] ?? ''), 100);
$email   = one_line((string)($_POST['email'] ?? ''), 150);
$topic   = one_line((string)($_POST['topic'] ?? ''), 100);
$message = trim((string)($_POST['message'] ?? ''));
$message = mb_substr(str_replace("\r", '', $message), 0, 5000);

if ($name === '' || $message === '') {
    respond(false, 'Please fill in your name and a message.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.');
}

$subject = SITE_NAME . ' contact: ' . ($topic !== '' ? $topic : 'message') . ' (' . $name . ')';
$body = "Name: $name\nEmail: $email\nTopic: $topic\n\n$message\n";

$headers = [
    'From: ' . SITE_NAME . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = mail(TO_EMAIL, mb_encode_mimeheader($subject, 'UTF-8'), $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    respond(false, 'Your message could not be sent. Please try again later.');
}
respond(true);
