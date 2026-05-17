<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <meta name="base-url" content="<?php echo e(url('/')); ?>">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title><?php echo e($pageTitle ?? 'Dashboard'); ?> - Nova HMS</title>
    <link rel="preload" href="<?php echo e(asset('fonts/roobert/RoobertSemiBold.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo e(asset('fonts/roobert/RoobertBold.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Regular.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Medium.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo e(asset('css/app.css')); ?>?v=<?php echo e(filemtime(public_path('css/app.css'))); ?>">
    <?php echo $__env->yieldPushContent('styles'); ?>
</head>
<body>
    <div class="app-wrapper">
        <?php echo $__env->make('partials.sidebar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

        <div class="main-content" id="mainContent">
            <?php echo $__env->make('partials.topnav', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

            <div class="page-content">
                <?php echo $__env->yieldContent('content'); ?>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <?php if(auth()->guard()->check()): ?>
    <script>
        window.HMS_USER = {
            id:           <?php echo e(auth()->id()); ?>,
            role:         '<?php echo e(auth()->user()->role); ?>',
            isSuperadmin: <?php echo e(auth()->user()->isSuperadmin() ? 'true' : 'false'); ?>,
            isAdmin:      <?php echo e(auth()->user()->isAdmin() ? 'true' : 'false'); ?>,
            permissions:  <?php echo json_encode(auth()->user()->isSuperadmin() ? ['*'] : auth()->user()->permissionSlugs(), 15, 512) ?>
        };
    </script>
    <?php endif; ?>
    <script src="<?php echo e(asset('js/app.js')); ?>"></script>
    <?php echo $__env->yieldPushContent('scripts'); ?>
</body>
</html>
<?php /**PATH C:\xampp\htdocs\healthops\resources\views/layouts/app.blade.php ENDPATH**/ ?>