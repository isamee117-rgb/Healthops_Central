@extends('layouts.app')

@section('content')
<style>
    .err-403-wrap {
        min-height: calc(100vh - 120px);
        display: flex; align-items: center; justify-content: center;
        padding: 40px 24px;
    }
    .err-403-card {
        background: #fff; border-radius: 20px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.10);
        padding: 56px 48px; max-width: 520px; width: 100%; text-align: center;
    }
    .err-403-icon {
        width: 88px; height: 88px; border-radius: 50%;
        background: linear-gradient(135deg,#fee2e2,#fecaca);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 28px;
    }
    .err-403-icon svg { width: 44px; height: 44px; color: #dc2626; }
    .err-403-code {
        font-size: 72px; font-weight: 800; color: #003366;
        line-height: 1; margin-bottom: 8px; letter-spacing: -2px;
    }
    .err-403-title {
        font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 12px;
    }
    .err-403-desc {
        font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 32px;
    }
    .err-403-perm {
        display: inline-block; background: #f1f5f9; border: 1px solid #e2e8f0;
        border-radius: 8px; padding: 8px 16px; font-family: monospace;
        font-size: 13px; color: #475569; margin-bottom: 32px;
    }
    .err-403-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .err-403-btn-primary {
        padding: 12px 28px; background: #003366; color: #7fffd4;
        border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
        cursor: pointer; text-decoration: none; transition: opacity .2s;
    }
    .err-403-btn-primary:hover { opacity: .88; color: #7fffd4; }
    .err-403-btn-secondary {
        padding: 12px 28px; background: #f8fafc; color: #475569;
        border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px;
        font-weight: 600; cursor: pointer; text-decoration: none; transition: all .2s;
    }
    .err-403-btn-secondary:hover { background: #e2e8f0; color: #1e293b; }
</style>

<div class="err-403-wrap">
    <div class="err-403-card">
        <div class="err-403-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
        </div>
        <div class="err-403-code">403</div>
        <div class="err-403-title">Access Denied</div>
        <div class="err-403-desc">
            You don't have permission to view this page.<br>
            Contact your administrator to request access.
        </div>
        @if(!empty($permission))
        <div class="err-403-perm">
            Required permission: <strong>{{ $permission }}</strong>
        </div>
        @endif
        <div class="err-403-actions">
            <a href="{{ $backUrl ?? '/' }}" class="err-403-btn-secondary">← Go Back</a>
            <a href="/" class="err-403-btn-primary">Go to Dashboard</a>
        </div>
    </div>
</div>
@endsection
