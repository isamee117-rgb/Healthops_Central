@extends('layouts.app')

@section('content')
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,rgba(127,255,212,0.15),rgba(0,51,102,0.08));display:flex;align-items:center;justify-content:center">
            <i data-lucide="bar-chart-3" style="width:24px;height:24px;color:var(--aqua-mint)"></i>
        </div>
        <div>
            <h2 style="font-size:22px;font-weight:700;color:var(--color-foreground);margin:0;font-family:'Roobert',sans-serif">Analytics & Statistics</h2>
            <p style="font-size:14px;color:var(--color-muted-foreground);margin:4px 0 0">View laboratory performance metrics, trends, and analytics</p>
        </div>
    </div>
</div>

<div style="text-align:center;padding:80px 20px;color:var(--color-muted-foreground)">
    <i data-lucide="bar-chart-3" style="width:64px;height:64px;margin-bottom:16px;opacity:0.3"></i>
    <h3 style="font-size:18px;font-weight:600;margin:0 0 8px">Analytics & Statistics</h3>
    <p style="font-size:14px;margin:0">This page will be built with detailed functionality. Coming soon.</p>
</div>
@endsection
