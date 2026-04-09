<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <meta name="base-url" content="<?php echo e(url('/')); ?>">
    <title>Login - HealthOps</title>
    <link rel="preload" href="<?php echo e(asset('fonts/roobert/RoobertSemiBold.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo e(asset('fonts/roobert/RoobertBold.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Regular.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Medium.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <style>
        @font-face {
            font-family: 'Roobert';
            src: url('<?php echo e(asset('fonts/roobert/RoobertRegular.woff2')); ?>') format('woff2'),
                 url('<?php echo e(asset('fonts/roobert/RoobertRegular.ttf')); ?>') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'Roobert';
            src: url('<?php echo e(asset('fonts/roobert/RoobertMedium.woff2')); ?>') format('woff2'),
                 url('<?php echo e(asset('fonts/roobert/RoobertMedium.ttf')); ?>') format('truetype');
            font-weight: 500;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'Roobert';
            src: url('<?php echo e(asset('fonts/roobert/RoobertSemiBold.woff2')); ?>') format('woff2'),
                 url('<?php echo e(asset('fonts/roobert/RoobertSemiBold.ttf')); ?>') format('truetype');
            font-weight: 600;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'Roobert';
            src: url('<?php echo e(asset('fonts/roobert/RoobertBold.woff2')); ?>') format('woff2'),
                 url('<?php echo e(asset('fonts/roobert/RoobertBold.ttf')); ?>') format('truetype');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'SF Pro Display';
            src: url('<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Regular.woff2')); ?>') format('woff2'),
                 url('<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Regular.otf')); ?>') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'SF Pro Display';
            src: url('<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Medium.woff2')); ?>') format('woff2'),
                 url('<?php echo e(asset('fonts/sfpro/SF-Pro-Text-Medium.otf')); ?>') format('opentype');
            font-weight: 500;
            font-style: normal;
            font-display: swap;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Roobert', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0FF8B9 0%, #060740 100%);
            padding: 24px;
        }

        .login-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            padding: 48px;
            width: 100%;
            max-width: 440px;
        }

        .login-logo {
            text-align: center;
            margin-bottom: 32px;
        }

        .healthops-logo-img {
            height: 55px;
            width: auto;
            transform: translateY(10px);
        }

        .login-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .login-header h2 {
            font-size: 24px;
            font-weight: 600;
            color: #060740;
            margin-bottom: 8px;
        }

        .login-header p {
            font-size: 14px;
            color: #6C757D;
        }

        .alert-error {
            background: #FEE2E2;
            border: 1px solid #FCA5A5;
            color: #DC3545;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 24px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .alert-error svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #2C3E50;
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            font-family: 'Roobert', -apple-system, BlinkMacSystemFont, sans-serif;
            border: 1px solid #DEE2E6;
            border-radius: 6px;
            transition: all 0.3s ease;
            color: #2C3E50;
            background: white;
        }

        .form-input:focus {
            outline: none;
            border-color: #0FF8B9;
            box-shadow: 0 0 0 3px rgba(127, 255, 212, 0.2);
        }

        .form-input.is-invalid {
            border-color: #DC3545;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .form-input::placeholder {
            color: #ADB5BD;
        }

        .password-input-wrapper {
            position: relative;
        }

        .password-input-wrapper .form-input {
            padding-right: 48px;
        }

        .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #6C757D;
            padding: 4px;
            display: flex;
            align-items: center;
        }

        .password-toggle:hover {
            color: #060740;
        }

        .password-toggle svg {
            width: 18px;
            height: 18px;
        }

        .remember-me {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
        }

        .remember-me input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            cursor: pointer;
            accent-color: #060740;
            border-radius: 4px;
        }

        .remember-me label {
            font-size: 14px;
            color: #2C3E50;
            cursor: pointer;
        }

        .btn-login {
            width: 100%;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: 600;
            font-family: 'Roobert', sans-serif;
            color: #060740;
            background: #0FF8B9;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-login:hover {
            background: #6EEFC4;
            box-shadow: 0 4px 12px rgba(127, 255, 212, 0.4);
            transform: translateY(-2px);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .btn-login svg {
            width: 18px;
            height: 18px;
        }

        .invalid-feedback {
            font-size: 13px;
            color: #DC3545;
            margin-top: 6px;
        }

        .login-footer {
            text-align: center;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #DEE2E6;
        }

        .login-footer-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 16px;
        }

        .login-footer a {
            color: #060740;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }

        .login-footer a:hover {
            color: #0FF8B9;
            text-decoration: underline;
        }

        .login-footer-copyright {
            font-size: 12px;
            color: #ADB5BD;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-logo">
                <img src="<?php echo e(asset('images/healthops-logo.svg')); ?>" alt="HealthOps" class="healthops-logo-img">
            </div>

            <div class="login-header">
                <h2>Login to HMS</h2>
                <p>Enter your credentials to access the system</p>
            </div>

            <?php if($errors->any()): ?>
                <div class="alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span><?php echo e($errors->first()); ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="<?php echo e(url('/login')); ?>">
                <?php echo csrf_field(); ?>

                <div class="form-group">
                    <label class="form-label" for="email">Email Address</label>
                    <input type="email" class="form-input <?php if($errors->has('email')): ?> is-invalid <?php endif; ?>" id="email" name="email" value="<?php echo e(old('email')); ?>" placeholder="Enter your email" required autofocus autocomplete="email">
                    <?php $__errorArgs = ['email'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                        <div class="invalid-feedback"><?php echo e($message); ?></div>
                    <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <div class="password-input-wrapper">
                        <input type="password" class="form-input <?php if($errors->has('password')): ?> is-invalid <?php endif; ?>" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
                        <button type="button" class="password-toggle" onclick="togglePassword()" aria-label="Toggle password visibility">
                            <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <svg id="eyeOffIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        </button>
                    </div>
                    <?php $__errorArgs = ['password'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?>
                        <div class="invalid-feedback"><?php echo e($message); ?></div>
                    <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
                </div>

                <div class="remember-me">
                    <input type="checkbox" id="remember" name="remember" <?php echo e(old('remember') ? 'checked' : ''); ?>>
                    <label for="remember">Remember Me</label>
                </div>

                <button type="submit" class="btn-login">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                    LOGIN
                </button>
            </form>

            <div class="login-footer">
                <div class="login-footer-links">
                    <a href="#">Forgot Password?</a>
                </div>
                <div class="login-footer-copyright">&copy; <?php echo e(date('Y')); ?> HealthOps. All rights reserved.</div>
            </div>
        </div>
    </div>

    <script>
        function togglePassword() {
            var p = document.getElementById('password');
            var on = document.getElementById('eyeIcon');
            var off = document.getElementById('eyeOffIcon');
            if (p.type === 'password') {
                p.type = 'text';
                on.style.display = 'none';
                off.style.display = 'block';
            } else {
                p.type = 'password';
                on.style.display = 'block';
                off.style.display = 'none';
            }
        }
    </script>
</body>
</html>
<?php /**PATH C:\xampp\htdocs\makosh\resources\views/auth/login.blade.php ENDPATH**/ ?>