<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\{DB, Schema};

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('otp_verifications', function (Blueprint $table) {
            $table->string('purpose', 20)->default('registration')->after('email');
            $table->unsignedTinyInteger('attempts')->default(0)->after('expires_at');
            $table->index(['email', 'purpose']);
        });

        // Widen otp to fit a bcrypt hash; raw SQL avoids a doctrine/dbal
        // dependency for a plain column-type change.
        DB::statement('ALTER TABLE otp_verifications MODIFY otp VARCHAR(255) NOT NULL');
    }

    public function down(): void
    {
        Schema::table('otp_verifications', function (Blueprint $table) {
            $table->dropIndex(['email', 'purpose']);
            $table->dropColumn(['purpose', 'attempts']);
        });

        DB::statement("ALTER TABLE otp_verifications MODIFY otp VARCHAR(6) NOT NULL");
    }
};
