<?php

namespace App\Traits;

trait MasksData
{
    /**
     * Mask phone number: show first 4 + last 2, mask middle
     * E.g. 081234567890 → 0812******90
     */
    protected function maskPhone(?string $phone): string
    {
        if (!$phone || strlen($phone) < 7) {
            return $phone ?? '';
        }

        $len = strlen($phone);
        $visibleStart = 4;
        $visibleEnd   = 2;
        $masked = substr($phone, 0, $visibleStart)
            . str_repeat('*', max(0, $len - $visibleStart - $visibleEnd))
            . substr($phone, -$visibleEnd);

        return $masked;
    }

    /**
     * Mask email: show first 2 chars of local + domain
     * E.g. johndoe@gmail.com → jo***@gmail.com
     */
    protected function maskEmail(?string $email): string
    {
        if (!$email || !str_contains($email, '@')) {
            return $email ?? '';
        }

        [$local, $domain] = explode('@', $email, 2);

        $visibleChars = min(2, strlen($local));
        $masked = substr($local, 0, $visibleChars)
            . str_repeat('*', max(3, strlen($local) - $visibleChars))
            . '@' . $domain;

        return $masked;
    }
}
