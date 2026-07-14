<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\OtpVerification;
use Illuminate\Support\Facades\{Hash, Log, Mail};

class OtpService
{
    public const TTL_MINUTES = 5;
    public const MAX_ATTEMPTS = 5;
    public const RESEND_COOLDOWN_SECONDS = 60;

    /**
     * Generate a fresh OTP for the given email/purpose, store it hashed,
     * and email it via the configured mailer (Brevo SMTP).
     */
    public function generateAndSend(string $email, string $purpose): void
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpVerification::updateOrCreate(
            ['email' => $email, 'purpose' => $purpose],
            [
                'otp'        => Hash::make($otp),
                'expires_at' => now()->addMinutes(self::TTL_MINUTES),
                'attempts'   => 0,
            ]
        );

        try {
            Mail::to($email)->send(new OtpMail($otp));
        } catch (\Throwable $e) {
            // Don't block the request on a transport failure, but ALWAYS log
            // it — a silent catch here previously made SMTP problems
            // undiagnosable ("mail not working" with an empty laravel.log).
            Log::error('OTP mail failed to send', [
                'email'   => $email,
                'purpose' => $purpose,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    /**
     * Seconds remaining before another OTP may be requested for this
     * email/purpose, or 0 if a new one may be sent right now.
     */
    public function secondsUntilResendAllowed(string $email, string $purpose): int
    {
        $record = OtpVerification::where('email', $email)->where('purpose', $purpose)->first();
        if (!$record) return 0;

        $elapsed = $record->updated_at->diffInSeconds(now());
        return max(0, self::RESEND_COOLDOWN_SECONDS - $elapsed);
    }

    /**
     * Verify the given OTP. On success the record is deleted (one-time
     * use). On failure, increments the attempt counter and deletes the
     * record outright once expired or over the attempt limit.
     *
     * @return array{ok: bool, message?: string}
     */
    public function verify(string $email, string $otp, string $purpose): array
    {
        $record = OtpVerification::where('email', $email)->where('purpose', $purpose)->first();

        if (!$record) {
            return ['ok' => false, 'message' => 'No OTP request found. Please request a new one.'];
        }

        if ($record->isExpired()) {
            $record->delete();
            return ['ok' => false, 'message' => 'OTP expired. Please request a new one.'];
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            $record->delete();
            return ['ok' => false, 'message' => 'Too many incorrect attempts. Please request a new OTP.'];
        }

        if (!Hash::check($otp, $record->otp)) {
            $record->increment('attempts');
            $remaining = self::MAX_ATTEMPTS - $record->attempts;
            return ['ok' => false, 'message' => "Incorrect OTP. {$remaining} attempt(s) remaining."];
        }

        $record->delete();
        return ['ok' => true];
    }
}
