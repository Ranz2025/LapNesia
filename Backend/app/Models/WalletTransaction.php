<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $reference_id
 * @property string $reference_type
 */
class WalletTransaction extends Model
{
    const TYPE_SALE_INCOME = 'sale_income';

    const TYPE_INSPECTION_FEE = 'inspection_fee';

    const TYPE_INSPECTION_INCOME = 'inspection_income';

    const TYPE_INSPECTION_INCOME_RELEASE = 'inspection_income_release';

    const TYPE_WITHDRAW = 'withdraw';

    const TYPE_REFUND = 'refund';

    const TYPE_PLATFORM_FEE_ADJUSTMENT = 'platform_fee_adjustment';

    const TYPE_ESCROW_RELEASE = 'escrow_release';

    const TYPE_FREEZE_FOR_WITHDRAWAL = 'freeze';

    const TYPE_RELEASE_FREEZE = 'release_freeze';

    protected $fillable = [
        'wallet_id',
        'reference_id',
        'reference_type',
        'type',
        'status',
        'amount',
        'balance_before',
        'balance_after',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function wallet(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function reference(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo();
    }
}
