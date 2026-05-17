<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $maxOrder = DB::table('permissions')->max('display_order') ?? 0;

        DB::table('permissions')->insertOrIgnore([
            [
                'name'          => 'Form Builder Access',
                'slug'          => 'form-builder.access',
                'description'   => 'View the Form Builder and preview forms',
                'module'        => 'form-builder',
                'parent_module' => 'configuration',
                'level'         => 'page',
                'action_type'   => null,
                'is_dangerous'  => false,
                'display_order' => $maxOrder + 1,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'name'          => 'Form Builder Manage',
                'slug'          => 'form-builder.manage',
                'description'   => 'Create, edit and delete form groups, forms, sections, and components',
                'module'        => 'form-builder',
                'parent_module' => 'configuration',
                'level'         => 'action',
                'action_type'   => 'write',
                'is_dangerous'  => false,
                'display_order' => $maxOrder + 2,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('permissions')->whereIn('slug', ['form-builder.access', 'form-builder.manage'])->delete();
    }
};
