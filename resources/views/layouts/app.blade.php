<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="base-url" content="{{ url('/') }}">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>{{ $pageTitle ?? 'Dashboard' }} - Nova HMS</title>
    <link rel="preload" href="{{ asset('fonts/roobert/RoobertSemiBold.woff2') }}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{ asset('fonts/roobert/RoobertBold.woff2') }}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{ asset('fonts/sfpro/SF-Pro-Text-Regular.woff2') }}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{ asset('fonts/sfpro/SF-Pro-Text-Medium.woff2') }}" as="font" type="font/woff2" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}?v={{ filemtime(public_path('css/app.css')) }}">
    @stack('styles')
</head>
<body>
    <div class="app-wrapper">
        @include('partials.sidebar')

        <div class="main-content" id="mainContent">
            @include('partials.topnav')

            <div class="page-content">
                @yield('content')
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    @auth
    <script>
        window.HMS_USER = {
            id:           {{ auth()->id() }},
            role:         '{{ auth()->user()->role }}',
            isSuperadmin: {{ auth()->user()->isSuperadmin() ? 'true' : 'false' }},
            isAdmin:      {{ auth()->user()->isAdmin() ? 'true' : 'false' }},
            permissions:  @json(auth()->user()->isSuperadmin() ? ['*'] : auth()->user()->permissionSlugs())
        };
    </script>
    @endauth
    <script src="{{ asset('js/app.js') }}"></script>
    @stack('scripts')
</body>
</html>
